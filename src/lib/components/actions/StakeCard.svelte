<script lang="ts">

  // Imports:
  import { ethers } from 'ethers';
  import { store } from '$lib/stores';
  import { erc20ABI } from '$lib/ABIs';
  import { nativeAddress, getTokenBalance, approveToken } from '$lib/helpers';
  import { formatArgs, getInteractionDetails, formatContractABI } from '$lib/tracks';
  import weaver from 'weaverfi';
  import * as toast from '$lib/toasts';
  import Button from '$lib/components/Button.svelte';
  import TokenLogo from '$lib/components/TokenLogo.svelte';

  // Type Imports:
  import type { ActionStatus } from '$lib/types';
  import type { Chain, Address } from 'weaverfi/dist/types';
  import type { InteractionsList, InteractionsListRoute, SmartContractInfo } from '$lib/types';

  // Initializations:
  export let network: Chain = 'avax';
  export let list: InteractionsList;
  export let contractInfo: Record<Address, SmartContractInfo>;
  export let location: InteractionsListRoute | undefined;
  export let onContinue: Function;
  let balance: number = 0;
  let stakingValue: number = 0;
  let allowance: number = 0;
  let status: ActionStatus = 'loading';
  let maxAllowance: boolean = false;
  let allowanceValue: number = 0;
  let stakeSuccessful: boolean = false;

  // Reactive Interaction Variables:
  $: staking = list && contractInfo && location ? getInteractionDetails(list, contractInfo, location) : undefined;
  $: token = staking ? staking.interaction?.tokens[0] : undefined;
  $: decimals = token ? contractInfo[token.address.toLowerCase() as Address]?.decimals ?? 18 : 18;
  $: contractABI = staking ? formatContractABI(staking) : undefined;
  
  // Reactive Token Updates:
  $: status, token, getStakingTokenBalance();
  $: status, token, checkAllowance();

  // Reactive Button Status:
  $: balance, stakingValue, allowance, updateButtonStatus();

  // Function to get staking token balance:
  const getStakingTokenBalance = async () => {
    if(token && (status === 'loading' || status === 'ready') && $store.address) {
      balance = await getTokenBalance($store.address, token.address, decimals, network);
      allowanceValue = balance;
    }
  }

  // Function to set maximum amount to stake:
  const setMaximumAmount = () => {
    if(token) {
      if(token.address === nativeAddress) {
        stakingValue = Math.max(0, balance - 0.2);
      } else {
        stakingValue = balance;
      }
    }
  }

  // Function to check if approval is needed:
  const checkAllowance = async () => {
    if($store.address && token && token.address !== nativeAddress && staking && staking.contract) {
      const rawAllowance = parseInt(await weaver[network].query(token.address, erc20ABI, 'allowance', [$store.address, staking.contract.address]));
      allowance = rawAllowance / (10 ** decimals);
    }
  }

  // Function to approve stake:
  const approve = async () => {
    if(token && token.address !== nativeAddress && staking && staking.contract) {
      const amountToApprove = maxAllowance ? ethers.constants.MaxUint256 : ethers.utils.parseUnits(allowanceValue.toString(), decimals);
      toast.bake(`Approving ${amountToApprove.toString()} ${token.symbol}`);
      const receipt = await approveToken(token.address, staking.contract.address, amountToApprove);
      toast.eat();
      if(receipt.status) {
        toast.bake(`Approval Successful`, { theme: 'success' });
      } else {
        toast.bake(`Approval Failed`, { theme: 'fail' });
      }
      checkAllowance();
    }
  }

  // Function to stake tokens:
  const stake = async () => {
    if(token && staking && staking.contract && staking.interaction && contractABI) {
      status = 'transacting';
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress() as Address;
      const stakingContract = new ethers.Contract(staking.contract.address, contractABI, signer);
      const txArgs = formatArgs(staking.interaction, address, [stakingValue], [decimals]);
      if(txArgs) {
        const tx: ethers.ContractTransaction = await stakingContract[staking.interaction.method](...txArgs);
        toast.bake(`Staking ${stakingValue.toLocaleString(undefined)} ${token.symbol}`);
        const receipt = await tx.wait();
        toast.eat();
        if(receipt.status) {
          toast.bake(`Stake Successful`, { theme: 'success' });
          stakeSuccessful = true;
        } else {
          toast.bake(`Stake Failed`, { theme: 'fail' });
        }
      }
    }
  }

  // Function to update button status:
  const updateButtonStatus = () => {
    if(stakingValue > balance) {
      status = 'missingBalance';
    } else if(token && token.address !== nativeAddress && allowance < stakingValue) {
      status = 'needsApproval';
    } else {
      status = 'ready';
    }
  }

</script>

<!-- #################################################################################################### -->

{#if staking && token}
  <div class="stake">
    {#if !stakeSuccessful}

      <!-- TODO - show if contract is verified on top right -->

      <!-- Title -->
      <h2>{location?.platform + ' ' ?? ''}Staking</h2>

      <!-- Input Token -->
      <div class="inputWrapper">
        <div class="inputToken">
          <input type="number" step=".01" bind:value={stakingValue} />
          <div class="formEnd">
            <Button on:click={setMaximumAmount} outline fontSize=".8em">MAX</Button>
            <div class="tokenLogo">
              <TokenLogo symbol={token.symbol} />
            </div>
            <span><strong>{token.symbol}</strong></span>
          </div>
        </div>
        <span class="small balance">Balance: <strong>{balance.toLocaleString(undefined, { maximumFractionDigits: 2 })} {token.symbol}</strong></span>
      </div>

      <!-- Stake Button -->
      <div class="stakeButton">
        {#if status === 'transacting'}
          <Button full disabled>Stake In Progress...</Button>
        {:else if status === 'loading'}
          <Button full disabled>Loading...</Button>
        {:else if status === 'missingBalance'}
          <Button full disabled>Insufficient Balance</Button>
        {:else if status === 'ready'}
          <Button on:click={stake} full disabled={!stakingValue}>Stake {token.symbol}</Button>
        {:else if status === 'needsApproval'}
          <label><input type="checkbox" bind:checked={maxAllowance} /> Infinite Approval?</label>
          <Button on:click={approve} full disabled={!stakingValue}>Approve {token.symbol}</Button>
        {/if}
      </div>

      <!-- TODO - add extra specific resources for track (video?) -->

    {:else}
      
      <!-- Success Display -->
      <div class="success">
        <i class="icofont-check-circled" />
        <h3>{token.symbol} Staked Successfully</h3>
        <Button full on:click={() => onContinue()} fontSize=".8em">Continue</Button>
      </div>

    {/if}
  </div>
{/if}

<!-- #################################################################################################### -->

<style>

  div.stake {
    display: flex;
    flex-direction: column;
    gap: 1em;
    padding: 1em;
    background: var(--greyBlue);
    border-radius: 1em;
  }

  div.inputToken {
    display: flex;
    align-items: center;
    gap: .5em;
    width: 100%;
    padding: .5em;
    border: 2px solid var(--darkBlue);
    border-radius: .8em;
  }

  div.inputToken > input {
    width: 100%;
  }

  input:focus {
    outline: none;
  }

  div.formEnd {
    display: flex;
    align-items: center;
    gap: .5em;
  }

  div.tokenLogo {
    display: flex;
    align-items: center;
    font-size: 1em;
  }

  span.balance {
    display: flex;
    justify-content: right;
    gap: .5em;
    margin: .5em .5em .5em 0;
  }

  div.stakeButton {
    width: 100%;
  }

  div.success {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1em;
  }

  div.success > i {
    margin: .3em 0 .2em;
    font-size: 7em;
    color: var(--lightGreen);
  }

  .small {
    font-size: .8em;
  }

</style>
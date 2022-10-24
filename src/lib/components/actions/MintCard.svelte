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
  let mintValue: number = 0;
  let allowance: number = 0;
  let status: ActionStatus = 'loading';
  let maxAllowance: boolean = false;
  let allowanceValue: number = 0;
  let mintSuccessful: boolean = false;

  // Reactive Interaction Variables:
  $: minting = list && contractInfo && location ? getInteractionDetails(list, contractInfo, location) : undefined;
  $: token = minting ? minting.interaction?.tokens[0] : undefined;
  $: decimals = token ? contractInfo[token.address.toLowerCase() as Address]?.decimals ?? 18 : 18;
  $: contractABI = minting ? formatContractABI(minting) : undefined;
  
  // Reactive Token Updates:
  $: status, token, getMintingTokenBalance();
  $: status, token, checkAllowance();

  // Reactive Button Status:
  $: balance, mintValue, allowance, updateButtonStatus();

  // Function to get minting token balance:
  const getMintingTokenBalance = async () => {
    if(token && (status === 'loading' || status === 'ready') && $store.address) {
      balance = await getTokenBalance($store.address, token.address, decimals, network);
      allowanceValue = balance;
    }
  }

  // Function to set maximum amount to mint with:
  const setMaximumAmount = () => {
    if(token) {
      if(token.address === nativeAddress) {
        mintValue = Math.max(0, balance - 0.2);
      } else {
        mintValue = balance;
      }
    }
  }

  // Function to check if approval is needed:
  const checkAllowance = async () => {
    if($store.address && token && token.address !== nativeAddress && minting && minting.contract) {
      const rawAllowance = parseInt(await weaver[network].query(token.address, erc20ABI, 'allowance', [$store.address, minting.contract.address]));
      allowance = rawAllowance / (10 ** decimals);
    }
  }

  // Function to approve mint:
  const approve = async () => {
    if(token && token.address !== nativeAddress && minting && minting.contract) {
      const amountToApprove = maxAllowance ? ethers.constants.MaxUint256 : ethers.utils.parseUnits(allowanceValue.toString(), decimals);
      toast.bake(`Approving ${amountToApprove.toString()} ${token.symbol}`);
      const receipt = await approveToken(token.address, minting.contract.address, amountToApprove);
      toast.eat();
      if(receipt.status) {
        toast.bake(`Approval Successful`, { theme: 'success' });
      } else {
        toast.bake(`Approval Failed`, { theme: 'fail' });
      }
      checkAllowance();
    }
  }

  // Function to mint tokens:
  const mint = async () => {
    if(token && minting && minting.contract && minting.interaction && contractABI) {
      status = 'transacting';
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress() as Address;
      const mintingContract = new ethers.Contract(minting.contract.address, contractABI, signer);
      const txArgs = formatArgs(minting.interaction, address, [mintValue], [decimals]);
      if(txArgs) {
        const tx: ethers.ContractTransaction = await mintingContract[minting.interaction.method](...txArgs);
        toast.bake(`Depositing ${mintValue.toLocaleString(undefined)} ${token.symbol}`);
        const receipt = await tx.wait();
        toast.eat();
        if(receipt.status) {
          toast.bake(`Mint Successful`, { theme: 'success' });
          mintSuccessful = true;
        } else {
          toast.bake(`Mint Failed`, { theme: 'fail' });
        }
      }
    }
  }

  // Function to update button status:
  const updateButtonStatus = () => {
    if(mintValue > balance) {
      status = 'missingBalance';
    } else if(token && token.address !== nativeAddress && allowance < mintValue) {
      status = 'needsApproval';
    } else {
      status = 'ready';
    }
  }

</script>

<!-- #################################################################################################### -->

{#if minting && token}
  <div class="mint">
    {#if !mintSuccessful}

      <!-- TODO - show if contract is verified on top right -->

      <!-- Title -->
      <h2>{location?.platform + ' ' ?? ''}Minting</h2>

      <!-- Input Token -->
      <div class="inputWrapper">
        <div class="inputToken">
          <input type="number" step=".01" bind:value={mintValue} />
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

      <!-- Mint Button -->
      <div class="mintButton">
        {#if status === 'transacting'}
          <Button full disabled>Minting In Progress...</Button>
        {:else if status === 'loading'}
          <Button full disabled>Loading...</Button>
        {:else if status === 'missingBalance'}
          <Button full disabled>Insufficient Balance</Button>
        {:else if status === 'ready'}
          <Button on:click={mint} full disabled={!mintValue}>{minting.contract?.symbol ? `Mint ${minting.contract.symbol}` : `Deposit ${token.symbol}`}</Button>
        {:else if status === 'needsApproval'}
          <label><input type="checkbox" bind:checked={maxAllowance} /> Infinite Approval?</label>
          <Button on:click={approve} full disabled={!mintValue}>Approve {token.symbol}</Button>
        {/if}
      </div>

      <!-- TODO - add extra specific resources for track (video?) -->

    {:else}
      
      <!-- Success Display -->
      <div class="success">
        <i class="icofont-check-circled" />
        <h3>{minting.contract?.symbol ? `${minting.contract.symbol} Minted` : `${token.symbol} Deposited`} Successfully</h3>
        <Button full on:click={() => onContinue()} fontSize=".8em">Continue</Button>
      </div>

    {/if}
  </div>
{/if}

<!-- #################################################################################################### -->

<style>

  div.mint {
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

  div.mintButton {
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
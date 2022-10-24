<script lang="ts">

  // Imports:
  import { ethers } from 'ethers';
  import { store } from '$lib/stores';
  import { erc20ABI, dexABI } from '$lib/ABIs';
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
  const wavax: Address = '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7';
  let status: ActionStatus = 'loading';
  let maxAllowance: boolean = false;
  let tokenRatio: number = 0;
  let lpSuccessful: boolean = false;

  // Token 1 Variables:
  let token1Balance: number = 0;
  let token1Value: number = 0;
  let token1Allowance: number = 0;
  let token1AllowanceValue: number = 0;
  let laggingToken1Value: number = 0;

  // Token 2 Variables:
  let token2Balance: number = 0;
  let token2Value: number = 0;
  let token2Allowance: number = 0;
  let token2AllowanceValue: number = 0;
  let laggingToken2Value: number = 0;

  // Reactive Interaction Variables:
  $: lp = list && contractInfo && location ? getInteractionDetails(list, contractInfo, location) : undefined;
  $: token1Details = lp ? lp.interaction?.tokens[0] : undefined;
  $: token2Details = lp ? lp.interaction?.tokens[1] : undefined;
  $: token1Decimals = token1Details ? contractInfo[token1Details.address.toLowerCase() as Address]?.decimals ?? 18 : 18;
  $: token2Decimals = token2Details ? contractInfo[token2Details.address.toLowerCase() as Address]?.decimals ?? 18 : 18;
  $: contractABI = lp ? formatContractABI(lp) : undefined;
  
  // Reactive Token Updates:
  $: status, token1Details, token2Details, getTokenBalances();
  $: status, token1Details, token2Details, checkAllowance();
  $: token1Details, token2Details, getTokenRatio();
  $: token1Value, setTokenValue({ secondToken: true });
  $: token2Value, setTokenValue();

  // Reactive Button Status:
  $: token1Balance, token2Balance, token1Value, token2Value, token1Allowance, token2Allowance, updateButtonStatus();

  // Function to get all token balances for LP:
  const getTokenBalances = async () => {
    if(token1Details && token2Details && (status === 'loading' || status === 'ready') && $store.address) {
      token1Balance = await getTokenBalance($store.address, token1Details.address, token1Decimals, network);
      token2Balance = await getTokenBalance($store.address, token2Details.address, token2Decimals, network);
      token1AllowanceValue = token1Balance;
      token2AllowanceValue = token2Balance;
    }
  }

  // Function to get token ratio in liquidity pool:
  const getTokenRatio = async () => {
    if(token1Details && token2Details && lp && lp.contract && contractABI) {
      const token1Address = token1Details.address === nativeAddress ? wavax : token1Details.address;
      const token2Address = token2Details.address === nativeAddress ? wavax : token2Details.address;
      const token1Input = ethers.utils.parseUnits('1', token1Decimals);
      const routerData = await weaver[network].query(lp.contract.address, dexABI, 'getAmountsOut', [token1Input, [token1Address, token2Address]]);
      const token2Output = parseInt(routerData[1]);
      tokenRatio = token2Output / (10 ** token2Decimals);
    }
  }

  // Function to set maximum amount to provide liquidity:
  const setMaximumAmount = (options?: { secondToken: boolean }) => {
    if(token1Details && token2Details) {
      if(options && options.secondToken) {
        token2Value = token2Details.address === nativeAddress ? Math.max(0, token1Balance - 0.2) : token2Balance;
      } else {
        token1Value = token1Details.address === nativeAddress ? Math.max(0, token1Balance - 0.2) : token1Balance;
      }
    }
  }

  // Function to set token value:
  const setTokenValue = (options?: { secondToken: boolean }) => {
    if(token1Details && token2Details) {
      if(options && options.secondToken && laggingToken1Value !== token1Value) {
        laggingToken1Value = token1Value;
        laggingToken2Value = Math.floor((token1Value * tokenRatio) * (10 ** token2Decimals)) / (10 ** token2Decimals);
        token2Value = laggingToken2Value;
      } else if(laggingToken2Value !== token2Value) {
        laggingToken2Value = token2Value;
        laggingToken1Value = Math.floor((token2Value / tokenRatio) * (10 ** token1Decimals)) / (10 ** token1Decimals);
        token1Value = laggingToken1Value;
      }
    }
  }

  // Function to check if approval is needed:
  const checkAllowance = async () => {
    if($store.address && token1Details && token2Details && lp && lp.contract) {
      if(token1Details.address !== nativeAddress) {
        const rawAllowance = parseInt(await weaver[network].query(token1Details.address, erc20ABI, 'allowance', [$store.address, lp.contract.address]));
        token1Allowance = rawAllowance / (10 ** token1Decimals);
      }
      if(token2Details.address !== nativeAddress) {
        const rawAllowance = parseInt(await weaver[network].query(token2Details.address, erc20ABI, 'allowance', [$store.address, lp.contract.address]));
        token2Allowance = rawAllowance / (10 ** token2Decimals);
      }
    }
  }

  // Function to approve all tokens for liquidity:
  const approveAllTokens = async () => {
    if(token1Details && token2Details && tokenRatio) {
      if(token1Details.address !== nativeAddress) {
        await approve(token1Details.address, token1Decimals, token1Details.symbol, token1AllowanceValue);
      }
      if(token2Details.address !== nativeAddress) {
        await approve(token2Details.address, token2Decimals, token2Details.symbol, token2AllowanceValue);
      }
    }
  }

  // Function to approve token to provide liquidity:
  const approve = async (address: Address, decimals: number, symbol: string, valueToApprove: number) => {
    if(lp && lp.contract) {
      const amountToApprove = maxAllowance ? ethers.constants.MaxUint256 : ethers.utils.parseUnits(valueToApprove.toString(), decimals);
      toast.bake(`Approving ${amountToApprove.toString()} ${symbol}`);
      const receipt = await approveToken(address, lp.contract.address, amountToApprove);
      toast.eat();
      if(receipt.status) {
        toast.bake(`Approval Successful`, { theme: 'success' });
      } else {
        toast.bake(`Approval Failed`, { theme: 'fail' });
      }
      checkAllowance();
    }
  }

  // Function to provide liquidity:
  const provideLiquidity = async () => {
    if(token1Details && token2Details && lp && lp.contract && lp.interaction && contractABI && tokenRatio) {
      status = 'transacting';
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress() as Address;
      const lpContract = new ethers.Contract(lp.contract.address, contractABI, signer);
      const txArgs = formatArgs(lp.interaction, address, [token1Value, token2Value], [token1Decimals, token2Decimals]);
      if(txArgs) {
        const tx: ethers.ContractTransaction = await lpContract[lp.interaction.method](...txArgs);
        toast.bake(`Providing ${token1Value.toLocaleString(undefined)} ${token1Details.symbol} & ${token2Value.toLocaleString(undefined)} ${token2Details.symbol} as liquidity`);
        const receipt = await tx.wait();
        toast.eat();
        if(receipt.status) {
          toast.bake(`LP Successful`, { theme: 'success' });
          lpSuccessful = true;
        } else {
          toast.bake(`LP Failed`, { theme: 'fail' });
        }
      }
    }
  }

  // Function to update button status:
  const updateButtonStatus = () => {
    if(token1Value > token1Balance) {
      status = 'missingBalance1';
    } else if(token2Value > token2Balance) {
      status = 'missingBalance2';
    } else if(token1Details && token1Details.address !== nativeAddress && token1Allowance < token1Value) {
      status = 'needsApproval1';
    } else if(token2Details && token2Details.address !== nativeAddress && token2Allowance < token2Value) {
      status = 'needsApproval2';
    } else if(!tokenRatio) {
      status = 'loading';
    } else {
      status = 'ready';
    }
  }

</script>

<!-- #################################################################################################### -->

{#if lp && token1Details && token2Details}
  <div class="lp">
    {#if !lpSuccessful}

      <!-- TODO - show if contract is verified on top right -->

      <!-- Title -->
      <h2>{location?.platform + ' ' ?? ''}Liquidity</h2>

      <!-- Input Token 1 -->
      <div class="inputWrapper">
        <div class="inputToken">
          <input type="number" step=".01" bind:value={token1Value} />
          <div class="formEnd">
            <Button on:click={() => setMaximumAmount()} outline fontSize=".8em">MAX</Button>
            <div class="tokenLogo">
              <TokenLogo symbol={token1Details.symbol} />
            </div>
            <span><strong>{token1Details.symbol}</strong></span>
          </div>
        </div>
        <span class="small balance">Balance: <strong>{token1Balance.toLocaleString(undefined, { maximumFractionDigits: 2 })} {token1Details.symbol}</strong></span>
      </div>

      <!-- Input Token 2 -->
      <div class="inputWrapper">
        <div class="inputToken">
          <input type="number" step=".01" bind:value={token2Value} />
          <div class="formEnd">
            <Button on:click={() => setMaximumAmount({ secondToken: true })} outline fontSize=".8em">MAX</Button>
            <div class="tokenLogo">
              <TokenLogo symbol={token2Details.symbol} />
            </div>
            <span><strong>{token2Details.symbol}</strong></span>
          </div>
        </div>
        <span class="small balance">Balance: <strong>{token2Balance.toLocaleString(undefined, { maximumFractionDigits: 2 })} {token2Details.symbol}</strong></span>
      </div>

      <!-- LP Button -->
      <div class="lpButton">
        {#if status === 'transacting'}
          <Button full disabled>Providing Liquidity...</Button>
        {:else if status === 'loading'}
          <Button full disabled>Loading...</Button>
        {:else if status === 'missingBalance1'}
          <Button full disabled>Insufficient {token1Details.symbol} Balance</Button>
        {:else if status === 'missingBalance2'}
          <Button full disabled>Insufficient {token2Details.symbol} Balance</Button>
        {:else if status === 'ready'}
          <Button on:click={provideLiquidity} full disabled={!token1Value || !token2Value}>Provide Liquidity</Button>
        {:else if status === 'needsApproval1'}
          <label><input type="checkbox" bind:checked={maxAllowance} /> Infinite Approval?</label>
          <Button on:click={approveAllTokens} full disabled={!token1Value || !token2Value}>Approve Tokens</Button>
        {/if}
      </div>

      <!-- TODO - add extra specific resources for track (video?) -->

    {:else}
      
      <!-- Success Display -->
      <div class="success">
        <i class="icofont-check-circled" />
        <h3>Liquidity Provided Successfully</h3>
        <Button full on:click={() => onContinue()} fontSize=".8em">Continue</Button>
      </div>

    {/if}

  </div>
{/if}

<!-- #################################################################################################### -->

<style>

  div.lp {
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

  div.lpButton {
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
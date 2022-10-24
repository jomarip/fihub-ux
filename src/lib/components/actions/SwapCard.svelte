<script lang="ts">

  // Imports:
  import { ethers } from 'ethers';
  import { onMount } from 'svelte';
  import { store } from '$lib/stores';
  import { ParaSwap } from 'paraswap';
  import { nativeAddress, getTokenBalance } from '$lib/helpers';
  import weaver from 'weaverfi';
  import * as toast from '$lib/toasts';
  import Button from '$lib/components/Button.svelte';
  import TokenLogo from '$lib/components/TokenLogo.svelte';

  // Type Imports:
  import type { ActionStatus } from '$lib/types';
  import type { OptimalRate } from 'paraswap-core';
  import type { Token, Transaction } from 'paraswap';
  import type { Allowance } from 'paraswap/build/types';
  import type { Chain, Address, Hash } from 'weaverfi/dist/types';

  // Initializations:
  export let network: Chain = 'avax';
  export let from: string = 'AVAX';
  export let to: string;
  let status: ActionStatus = 'loading';
  let tokens: Token[] = [];
  let maxAllowance: boolean = false;
  let allowanceValue: number = 0;
  let paraswapRoute: OptimalRate | undefined = undefined;

  // 'From' Token Variables:
  let fromAddress: Address = nativeAddress;
  let fromBalance: number = 0;
  let fromDecimals: number = 18;
  let fromValue: number = 0;
  let fromAllowance: number = 0;

  // 'To' Token Variables:
  let toAddress: Address | undefined = undefined;
  let toBalance: number = 0;
  let toDecimals: number = 18;
  let toValue: number = 0;

  // Initializing ParaSwap SDK:
  const paraswap = new ParaSwap();

  // Reactive Network Info:
  $: networkInfo = weaver[network].getInfo();
  
  // Reactive Token Updates:
  $: status, getFromTokenBalance();
  $: to, status, getToTokenInfo();
  $: toAddress, fromValue, getRate();
  $: status, checkAllowance();

  // Reactive Button Status:
  $: fromBalance, fromValue, fromAllowance, updateButtonStatus();

  // Function to get 'from' token balance:
  const getFromTokenBalance = async () => {
    if((status === 'loading' || status === 'ready') && $store.address) {
      fromBalance = await getTokenBalance($store.address, fromAddress, fromDecimals, network);
      allowanceValue = fromBalance;
    }
  }

  // Function to get 'to' token info:
  const getToTokenInfo = async () => {
    if((status === 'loading' || status === 'ready') && $store.address) {
      const token = tokens.find(token => token.symbol === to);
      if(token) {
        toAddress = token.address as Address;
        toDecimals = token.decimals;
        toBalance = await getTokenBalance($store.address, toAddress, toDecimals, network);
      }
    }
  }

  // Function to set maximum amount to swap:
  const setMaximumAmount = () => {
    if(from === 'AVAX') {
      fromValue = Math.max(0, fromBalance - 0.2);
    } else {
      fromValue = fromBalance;
    }
  }

  // Function to check if approval is needed:
  const checkAllowance = async () => {
    if($store.address && fromAddress !== nativeAddress) {
      const allowance = (await paraswap.getAllowance($store.address, fromAddress)) as Allowance;
      fromAllowance = parseInt(allowance.allowance) / (10 ** fromDecimals);
    }
  }

  // Function to approve swap:
  const approve = async () => {
    if($store.address && fromAddress !== nativeAddress) {
      const approvalAmount = (maxAllowance ? ethers.constants.MaxUint256 : allowanceValue * (10 ** fromDecimals)).toString();
      toast.bake(`Approving ${parseInt(approvalAmount)} ${from}`);
      const txHash = (await paraswap.approveToken(approvalAmount, $store.address, fromAddress)) as Hash;
      toast.eat();
      if(txHash) {
        toast.bake(`Approval Successful`, { theme: 'success' });
        checkAllowance();
      } else {
        toast.bake(`Approval Failed`, { theme: 'fail' });
      }
    }
  }

  // Function to get swap rate:
  const getRate = async () => {
    if(toAddress && fromValue > 0) {
      paraswapRoute = (await paraswap.getRate(fromAddress, toAddress, (fromValue * (10 ** fromDecimals)).toString())) as OptimalRate;
    }
  }

  // Function to swap tokens:
  const swap = async () => {
    if($store.address && toAddress && paraswapRoute) {
      status = 'transacting';
      toast.bake(`Swapping ${from} for ${to}`);
      const txParams = (await paraswap.buildTx(fromAddress, toAddress, (fromValue * (10 ** fromDecimals)).toString(), toValue.toString(), paraswapRoute, $store.address, 'FiHub')) as Transaction;
      const txHash = (await paraswap.web3Provider.send('eth_sendTransaction', txParams)) as Hash;
      toast.eat();
      if(txHash) {
        toast.bake(`Swap Successful`, { theme: 'success' });
        checkAllowance();
      } else {
        toast.bake(`Swap Failed`, { theme: 'fail' });
      }
    }
  }

  // Function to update button status:
  const updateButtonStatus = () => {
    if(fromValue > fromBalance) {
      status = 'missingBalance';
    } else if(fromAddress !== nativeAddress && fromAllowance < fromValue) {
      status = 'needsApproval';
    } else {
      status = 'ready';
    }
  }
  
  onMount(async () => {
    paraswap.setWeb3Provider(new ethers.providers.Web3Provider(window.ethereum));
    tokens = (await paraswap.getTokens() as Token[]).filter(token => token.network === networkInfo.id);
    checkAllowance();
  });

</script>

<!-- #################################################################################################### -->

<div class="wrapper">

  <!-- Input Token Balance -->
  <div class="balance">
    <span class="small"><strong>{fromBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} {from}</strong></span>
  </div>

  <!-- Input Token -->
  <div class="inputToken">
    <input type="number" step=".01" bind:value={fromValue} />
    <div class="formEnd">
      <Button on:click={setMaximumAmount} outline>Max</Button>
      <div class="tokenLogo">
        <TokenLogo symbol={from} />
      </div>
      <span><strong>{from}</strong></span>
    </div>
  </div>

  <!-- Arrow -->
  <i class="icofont-arrow-down" />

  <!-- Output Token Balance -->
  <div class="balance">
    <span class="small"><strong>{toBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} {to}</strong></span>
  </div>

  <!-- Output Token -->
  <div class="outputToken">
    <div class="value">{toValue}</div>
    <div class="formEnd">
      <div class="tokenLogo">
        <TokenLogo symbol={to} />
      </div>
      <span><strong>{to}</strong></span>
    </div>
  </div>

  <!-- Swap Button -->
  <div class="swapButton">
    {#if status === 'transacting'}
      <Button full disabled>Swap In Progress...</Button>
    {:else if status === 'loading'}
      <Button full disabled>Loading...</Button>
    {:else if status === 'missingBalance'}
      <Button full disabled>Insufficient Balance</Button>
    {:else if status === 'ready'}
      <Button on:click={swap} full disabled={!fromValue}>Swap</Button>
    {:else if status === 'needsApproval'}
      <label><input type="checkbox" bind:checked={maxAllowance} /> Max allowance</label>
      {#if !maxAllowance && fromValue}
        <div class="customApproval">
          <input type="number" step=".01" bind:value={allowanceValue} />
        </div>
      {/if}
      <Button on:click={approve} full disabled={!fromValue}>Approve</Button>
    {/if}
  </div>

</div>

<!-- #################################################################################################### -->

<style>

  div.wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1em;
    border-radius: 1em;
  }

  div.balance {
    display: flex;
    justify-content: end;
    width: 100%;
    margin-bottom: .2em;
  }

  div.inputToken, div.outputToken, div.customApproval {
    display: flex;
    gap: .5em;
    width: 100%;
    margin-bottom: .5em;
    padding: .2em .5em;
    border-radius: .8em;
  }

  div.inputToken > input, div.customApproval > input {
    width: 100%;
  }

  div.inputToken > input:focus, div.customApproval > input:focus {
    outline: none;
  }

  div.outputToken > div.value {
    width: 100%;
  }

  div.formEnd {
    display: flex;
    gap: .5em;
  }

  div.tokenLogo {
    height: 1em;
    width: 1em;
  }

  i.icofont-arrow-down {
    margin-bottom: .5em;
  }

  div.swapButton {
    width: 100%;
    margin-bottom: .5em;
  }

  .small {
    font-size: .8em;
  }

</style>
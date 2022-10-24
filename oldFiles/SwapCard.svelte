<script lang="ts">

  // <TODO> move to paraswap integration? no reason to lock ourselves with avalanche-specific dexes if we're planning to go multichain

  // TODO: extract approval to new component?
  // TODO: combine token whitelist and pngtoken lists. Decimals needs to be fetched from there aswell
  // TODO: Make the flip functionality work with token mid price

  import { onDestroy } from 'svelte';
  import { browser } from '$app/env';

  import Button from '$lib/components/Button.svelte';
  import { ethers } from 'ethers';
  import { store } from '$lib/stores';
  import { toast } from '@zerodevx/svelte-toast';
  import TokenLogo from '$lib/components/TokenLogo.svelte';
  import pngAbi from 'oldFiles/services/pngabis';
  import pngErc20Abi from 'oldFiles/services/pngerc20';
  import pngTokenAddresses from 'oldFiles/services/pngtokenaddresses';
  import { ChainId, Token, WAVAX, Fetcher, Route } from '@pangolindex/sdk';

  export let from: string = 'AVAX';
  export let to: string;

  let fromAddress: string = pngTokenAddresses.Tokens[from];
  let toAddress: string = pngTokenAddresses.Tokens[to];
  let dexRouterAddress = pngTokenAddresses.Router;

  let fromBalance: string = '0';
  let toBalance: string = '0';

  let maxAllowance = false;
  $: maxAllowanceValue = fromValue * 1.2;

  let fromValue: number = 0.1;
  let tokenMidPrice: number = 0.0058;

  $: toValue = fromValue / tokenMidPrice;

  let buttonStatus = 'loading';
  let swapInProgress: boolean = false;

  if (browser) {
    const interval = setInterval(() => {
      setBalance();
      setButtonStatus();
      setTokenMidPrices();
    }, 2000);

    setBalance();
    setButtonStatus();
    setTokenMidPrices();

    onDestroy(() => clearInterval(interval));
  }

  function setBalance() {
    if ($store && $store.tokensMap) {
      fromBalance = checkBalance($store.tokensMap, from);
      toBalance = checkBalance($store.tokensMap, to);
    }
  }

  function checkBalance(tokensMap, token): string {
    if (!tokensMap.hasOwnProperty(token)) return '0';

    return Number(
      ethers.utils.formatUnits(tokensMap[token].balance, tokensMap[token].decimals),
    ).toFixed(7);
  }

  async function setTokenMidPrices() {
    const providerForDex = new ethers.providers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);

    await providerForDex.ready;
    const LOST = new Token(ChainId.AVALANCHE, pngTokenAddresses.Tokens['LOST'], 18);
    const pair = await Fetcher.fetchPairData(LOST, WAVAX[LOST.chainId], providerForDex);
    const route = new Route([pair], LOST);

    tokenMidPrice = Number(route.midPrice.toSignificant(6));
  }

  async function swap() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    let pngContract = new ethers.Contract(dexRouterAddress, pngAbi, signer);
    if (fromValue) {
      const fromAmount = ethers.utils.parseEther(fromValue.toString()).toHexString();
      const swapTx = await pngContract.swapExactAVAXForTokens(
        0,
        [fromAddress, toAddress],
        $store.address,
        ethers.BigNumber.from(Math.floor(Date.now() / 1000) + 60 * 30),
        {
          value: fromAmount,
        },
      );
      if (swapTx.hash) {
        swapInProgress = true;

        toast.push('Swap pending', { duration: 30000 });

        provider.once(swapTx.hash, (transaction) => {
          if (transaction.blockNumber) {
            swapInProgress = true;
            toast.pop(0);
            toast.push('Swap successful', {
              theme: {
                '--toastColor': 'rgb(135, 221, 100)',
                '--toastBarBackground': 'rgb(135, 221, 100)',
              },
            });
          }
          swapInProgress = false;
        });
      }
    }
  }

  const setMaximumAmount = () => {
    fromValue = Math.max(Number(fromBalance) - 0.2, 0);
  };

  async function setButtonStatus() {
    if (fromBalance && from !== 'AVAX') await checkIfNeedsApproval();
    buttonStatus = !fromBalance ? 'no_funds' : 'swap';
  }

  async function checkIfNeedsApproval() {
    buttonStatus = 'loading';
    let allowance = await fetchAllowance(fromAddress);
    buttonStatus = !allowance ? 'needs_approval' : 'swap';
  }

  async function fetchAllowance(tokenContract) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const pngContract = new ethers.Contract(tokenContract, pngErc20Abi, signer);
    let allowance = await pngContract.allowance($store.address, dexRouterAddress);
    return ethers.utils.formatEther(allowance.toString());
  }

  async function approve() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    let pngContract = new ethers.Contract(pngTokenAddresses.Tokens.LOST, pngErc20Abi, signer);
    let approvalAllowanceValue;

    if (maxAllowance) {
      approvalAllowanceValue = ethers.constants.MaxUint256;
    } else {
      approvalAllowanceValue = ethers.BigNumber.from(
        ethers.utils.parseEther(maxAllowanceValue.toString()),
      );
    }
    const tx = await pngContract.approve(dexRouterAddress, approvalAllowanceValue);
  }

  function sanitize(e) {
    e.preventDefault();
    let value = e.target.value.replace(/,/g, '.').replace(/[^\d^\.]/g, '');

    fromValue = e.target.value = value;
  }
</script>

<div class="flex flex-col items-center rounded-2xl bg-dark p-6">
  <div class="mb-1 flex w-full justify-end">
    <span class="text-sm font-bold">{fromBalance} {from}</span>
  </div>
  <div
    class="mb-3 flex w-full gap-3 rounded-xl border border-card bg-dark py-2 px-3 text-white shadow"
  >
    <input
      type="text"
      autocomplete="off"
      autocorrect="off"
      class="w-full bg-dark focus:outline-0"
      inputmode="decimal"
      maxlength="79"
      minlength="1"
      pattern="^[0-9]*[.,]?[0-9]*$"
      spellcheck="false"
      step=".01"
      title="Token Amount"
      bind:value={fromValue}
      on:input={sanitize}
    />
    <div class="flex gap-2">
      <Button on:click={setMaximumAmount} variant={Variants.Outline} size={Sizes.Small}>Max</Button>
      <div class="h-6 w-6">
        <TokenLogo name={from} />
      </div>
      <span class="font-bold">{from}</span>
    </div>
  </div>
  <Icon src={ArrowDown} class="-mb-3 h-6 w-6" />
  <div class="mb-1 flex w-full justify-end">
    <span class="text-sm font-bold">{toBalance} {to}</span>
  </div>
  <div
    class="mb-3 flex w-full gap-3 rounded-xl border border-card bg-dark py-2 px-3 text-white shadow"
  >
    <div class="w-full bg-dark">{toValue}</div>
    <div class="flex">
      <div class="mr-2 h-6 w-6">
        <TokenLogo name={to} />
      </div>
      <span class="font-bold">{to}</span>
    </div>
  </div>
  <div class="mb-3 w-full">
    {#if swapInProgress}
      <Button full disabled>Swap in progress</Button>
    {:else if buttonStatus === 'loading' || buttonStatus === 'no_funds'}
      <Button full disabled
        >{buttonStatus === 'loading' ? 'Loading...' : 'Insufficient balance'}
      </Button>
    {:else if buttonStatus == 'swap'}
      <Button on:click={swap} full disabled={!fromValue}>Swap</Button>
    {:else if buttonStatus == 'needs_approval'}
      <label>
        <input type="checkbox" bind:checked={maxAllowance} />
        Max allowance
      </label>
      {#if !maxAllowance && fromValue}
        <div
          class="mb-3 flex w-full gap-3 rounded-xl border border-card bg-dark py-2 px-3 text-white shadow"
        >
          <input
            type="number"
            placeholder="0.00"
            step=".01"
            class="w-full bg-dark focus:outline-0"
            bind:value={maxAllowanceValue}
          />
          <div class="flex gap-2">
            <span class="font-bold">Max allowance</span>
          </div>
        </div>
      {/if}
      <Button on:click={approve} full disabled={!fromValue}>Approve</Button>
    {/if}
  </div>
  {#if fromValue}
    <div class="mb-3 flex w-full justify-between">
      <span>Minimum to receive</span>
      <span class="font-bold">{toValue} {to}</span>
    </div>
  {/if}
</div>

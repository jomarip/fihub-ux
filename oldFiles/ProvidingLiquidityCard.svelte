<script lang="ts">
  import { onDestroy } from 'svelte';
  import { ethers } from 'ethers';
  import { toast } from '@zerodevx/svelte-toast';
  import { Icon, CheckCircle, ExternalLink } from 'svelte-hero-icons';
  import { ChainId, Token, WAVAX, Fetcher, Route } from '@pangolindex/sdk';

  import { browser } from '$app/env';
  import { goto } from '$app/navigation';
  import { Colors, Sizes, Variants } from '$lib/enums';
  import { Button, TokenLogo } from '$lib/components';
  import { store } from '$lib/stores';

  import pngTokenAddresses from 'oldFiles/services/pngtokenaddresses';
  import pngErc20Abi from 'oldFiles/services/pngerc20';
  import pngAbi from 'oldFiles/services/pngabis';

  export let tokenA: string;
  export let tokenB: string;

  let rpcURL = import.meta.env.VITE_RPC_URL;

  let title = 'Providing Liquidity';
  let description =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

  let tokenAAddress = pngTokenAddresses.Tokens.WAVAX;
  let tokenAValue: number | null = null;
  let tokenABalance: string | null = '0';
  let tokenBAddress = pngTokenAddresses.Tokens.LOST;
  let tokenBValue: string | null = '0';
  let tokenBBalance: number | null = null;

  let tokenMidPrice: number = 0;
  let dexRouterAddress = pngTokenAddresses.Router;
  let needsApproval = true;
  let transactionInProgress: boolean = false;

  let pglTokenBalance = 0;
  let providingLiquidityFinished = false;
  let txHash: string;

  $: hasPGLTokens = $store?.tokensMap['PGL'];

  if (browser) {
    const interval = setInterval(() => {
      setApproval();
      setBalance();
      setTokenMidPrices();
    }, 2000);

    setApproval();
    setBalance();
    setTokenMidPrices();

    onDestroy(() => clearInterval(interval));
  }

  function setBalance() {
    if (!$store?.tokensMap) return;

    const AToken = $store.tokensMap[tokenA];
    const BToken = $store.tokensMap[tokenB];

    if (!AToken || !BToken) return;

    tokenABalance = ethers.utils.formatUnits(AToken.balance, AToken.decimals);
    tokenBBalance = ethers.utils.formatUnits(BToken.balance, BToken.decimals);
  }

  async function setApproval() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const pngContract = new ethers.Contract(tokenBAddress, pngErc20Abi, signer);
    const allowance = await pngContract.allowance($store.address, dexRouterAddress);
    needsApproval = allowance < ethers.constants.MaxUint256;
  }

  async function setTokenMidPrices() {
    const providerForDex = new ethers.providers.JsonRpcProvider(rpcURL);
    await providerForDex.ready;
    const LOST = new Token(ChainId.AVALANCHE, pngTokenAddresses.Tokens['LOST'], 18);
    const pair = await Fetcher.fetchPairData(LOST, WAVAX[LOST.chainId], providerForDex);
    const route = new Route([pair], LOST);
    tokenMidPrice = route.midPrice.toSignificant(6);
  }

  async function approveAndProvideLiquidity() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const pngContract = new ethers.Contract(tokenBAddress, pngErc20Abi, signer);
    const approveTx = await pngContract.approve(dexRouterAddress, ethers.constants.MaxUint256);

    if (approveTx.hash) {
      transactionInProgress = true;
      toast.push('Approval pending', { duration: 30000 });

      provider.once(approveTx.hash, (transaction) => {
        if (transaction.blockNumber) {
          toast.pop(0);
          toast.push('Approval successful', {
            theme: {
              '--toastColor': 'rgb(135, 221, 100)',
              '--toastBarBackground': 'rgb(135, 221, 100)',
            },
          });
        }

        provideLiquidity();
      });
    }
  }

  async function provideLiquidity() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const pngContract = new ethers.Contract(dexRouterAddress, pngAbi, signer);
    const desiredTokenBValue = ethers.utils.parseEther(tokenBValue.toString()).toHexString();

    const minimalDesiredTokenBValue = ethers.utils
      .parseEther((tokenBValue - (tokenBValue / 100) * 0.5).toString())
      .toHexString();

    const minimalTokenAValue = ethers.utils
      .parseEther((tokenAValue - (tokenAValue / 100) * 0.5).toString())
      .toHexString();

    const providingLiquidityTx = await pngContract
      .addLiquidityAVAX(
        tokenBAddress,
        desiredTokenBValue,
        minimalDesiredTokenBValue,
        minimalTokenAValue,
        $store.address,
        ethers.BigNumber.from(Math.floor(Date.now() / 1000) + 60 * 30),
        {
          value: minimalTokenAValue,
        },
      )
      .catch(() => (transactionInProgress = false));

    if (providingLiquidityTx.hash) {
      transactionInProgress = true;
      txHash = providingLiquidityTx.hash;

      toast.push('Transaction pending', { duration: 30000 });

      provider.once(providingLiquidityTx.hash, (transaction) => {
        if (transaction.blockNumber) {
          providingLiquidityFinished = true;
          toast.pop(0);
          toast.push('Transaction successful', {
            theme: {
              '--toastColor': 'rgb(135, 221, 100)',
              '--toastBarBackground': 'rgb(135, 221, 100)',
            },
          });
        }
        transactionInProgress = false;
      });
    }
  }

  const setMaximumAmount = (obj) => {
    let token = Object.keys(obj)[0];

    if (token === 'tokenA') {
      tokenAValue = obj.tokenA;
      tokenBValue = tokenAValue / tokenMidPrice;
    } else {
      tokenBValue = obj.tokenB;
      tokenAValue = tokenBValue * tokenMidPrice;
    }
  };

  function calculateTokenB(e) {
    e.preventDefault();
    let value = e.target.value.replace(/,/g, '.').replace(/[^\d^\.]/g, '');

    tokenAValue = e.target.value = value;

    tokenBValue = tokenAValue / tokenMidPrice;
  }

  function calculateTokenA(e) {
    e.preventDefault();
    let value = e.target.value.replace(/,/g, '.').replace(/[^\d^\.]/g, '');

    tokenBValue = e.target.value = value;

    tokenAValue = tokenBValue * tokenMidPrice;
  }
</script>

<div class="flex flex-col rounded-2xl bg-card p-6 text-white">
  {#if !providingLiquidityFinished}
    <div class="mb-6 flex items-center justify-end gap-2">
      <span class="text-sm">Verified Contract </span>
      <Icon src={CheckCircle} class="h-4 w-4 text-green" />
    </div>
    <h4 class="mb-2 font-bold">{title}</h4>
    <p class="mb-6 text-sm line-clamp-2">{description}</p>

    <div class="mb-1 flex w-full justify-end">
      <span class="text-sm font-bold">{tokenABalance} {tokenA}</span>
    </div>
    <div
      class="mb-3 flex w-full gap-3 rounded-xl border border-dark bg-card py-2 px-3 text-white shadow"
    >
      <input
        type="text"
        autocomplete="off"
        autocorrect="off"
        placeholder="0.00"
        inputmode="decimal"
        maxlength="79"
        minlength="1"
        pattern="^[0-9]*[.,]?[0-9]*$"
        spellcheck="false"
        step=".01"
        class="w-full bg-card focus:outline-0"
        bind:value={tokenAValue}
        on:input={calculateTokenB}
      />
      <div class="flex gap-2">
        <Button
          on:click={setMaximumAmount({ tokenA: tokenABalance })}
          variant={Variants.Outline}
          size={Sizes.Small}>Max</Button
        >
        <div class="h-6 w-6">
          <TokenLogo name={tokenA} />
        </div>
        <span class="font-bold">{tokenA}</span>
      </div>
    </div>

    <div class="mb-1 flex w-full justify-end">
      <span class="text-sm font-bold">{tokenBBalance} {tokenB}</span>
    </div>
    <div
      class="mb-3 flex w-full gap-3 rounded-xl border border-dark bg-card py-2 px-3 text-white shadow"
    >
      <input
        type="text"
        autocomplete="off"
        autocorrect="off"
        placeholder="0.00"
        inputmode="decimal"
        maxlength="79"
        minlength="1"
        pattern="^[0-9]*[.,]?[0-9]*$"
        spellcheck="false"
        step=".01"
        class="w-full bg-card focus:outline-0"
        bind:value={tokenBValue}
        on:input={calculateTokenA}
      />
      <div class="flex gap-2">
        <Button
          on:click={setMaximumAmount({ tokenB: tokenBBalance })}
          variant={Variants.Outline}
          size={Sizes.Small}>Max</Button
        >
        <div class="h-6 w-6">
          <TokenLogo name={tokenB} />
        </div>
        <span class="font-bold">{tokenB}</span>
      </div>
    </div>

    <div class="mb-3 w-full">
      {#if transactionInProgress}
        <Button full disabled>Transaction in progress</Button>
      {:else if tokenAValue > tokenABalance}
        <Button full color={Colors.Red} disabled>Insufficient {tokenA} balance</Button>
      {:else if tokenBValue > tokenBBalance}
        <Button full color={Colors.Red} disabled>Insufficient {tokenB} balance</Button>
      {:else if needsApproval}
        <Button on:click={approveAndProvideLiquidity} full disabled={!tokenAValue}>
          Approve allowance and provide liquidity
        </Button>
      {:else if !needsApproval}
        <Button on:click={provideLiquidity} full disabled={!tokenAValue}>Provide liquidity</Button>
      {:else}
        <Button full disabled>Getting allowance data...</Button>
      {/if}
    </div>
  {:else}
    <div class="flex flex-col items-center">
      <div class="my-8">
        <Icon src={CheckCircle} class="h-24 w-24 text-green" />
      </div>
      <h3 class="text-xl text-white">Liquidity Provided sucessfully</h3>
      <a
        href={`https://snowtrace.io/tx/${txHash}`}
        target="_blank"
        class="mb-6 flex h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm text-muted"
      >
        View transaction on snowtrace <Icon src={ExternalLink} class="h-4 w-4" />
      </a>

      <Button full on:click={() => goto('/track/LOST/options/liquidity/pangolin/options')}
        >Continue</Button
      >
    </div>
  {/if}
  {#if hasPGLTokens}
    <a
      href="/track/LOST/options/liquidity/pangolin/options"
      class="flex h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm text-muted"
    >
      Skip
    </a>
  {/if}
</div>

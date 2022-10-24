<script lang="ts">

  // Imports:
  import { page } from '$app/stores';
  import { store } from '$lib/stores';
  import weaver from 'weaverfi';
  import Button from '$lib/components/Button.svelte';
  import Section from '$lib/components/Section.svelte';
  import FeaturedCard from '$lib/components/FeaturedCard.svelte';
  import PortfolioItem from '$lib/components/PortfolioItem.svelte';
  import PortfolioDistribution from '$lib/components/PortfolioDistribution.svelte';

  // Type Imports:
  import type { Address, NativeToken, Token, LPToken, DebtToken, XToken } from 'weaverfi/dist/types';

  // Initializations:
  let copied: boolean = false;
  let fetching: boolean = true;
  let tokens: (NativeToken | Token)[] = [];
  let projectBalances: (NativeToken | Token | LPToken | DebtToken | XToken)[] = [];

  // Reactive Wallet Checks:
  $: ownWallet = $store.address?.toLowerCase() === $page.params.address.toLowerCase();
  $: $page.params.address, setBalances();

  // Function to get wallet's balances:
  const setBalances = async (options?: { refresh: boolean }) => {
    const address = $page.params.address as Address;
    fetching = true;
    if(ownWallet && options?.refresh) {
      $store.tokens = await weaver.avax.getWalletBalance(address);
      $store.projectBalances = await weaver.avax.getAllProjectBalances(address);
    } else if(!ownWallet) {
      tokens = await weaver.avax.getWalletBalance(address);
      projectBalances = await weaver.avax.getAllProjectBalances(address);
    }
    fetching = false;
  }

  // Function to copy address to clipboard:
  const copyAddress = () => {
    navigator.clipboard.writeText($page.params.address);
    copied = true;
    setTimeout(() => copied = false, 3000);
  }

</script>

<!-- #################################################################################################### -->

<!-- SvelteKit Dynamic Header -->
<svelte:head>
  <title>FiHub | Portfolio</title>
  <meta name="description" content="The hub for all things DeFi. Take a look at any portfolio here!" />
</svelte:head>

<!-- Overview Section -->
<div class="overview-wrapper">

  <!-- Wallet Information -->
  <div class="wallet">
    <img src="/avatar.svg" alt="Avatar" height="50px" width="50px" />
    <div class="info">
      <h2>{ownWallet ? 'Your' : ''} Wallet</h2>
      <div class="address">
        <span>{$page.params.address}</span>
        {#if copied}
          <span class="small">Copied!</span>
        {:else}
          <i class="small icofont-copy" on:click={copyAddress} />
        {/if}
      </div>
    </div>
  </div>

  <!-- Portfolio Distribution -->
  <div class="distribution">
    <PortfolioDistribution tokens={ownWallet ? $store.tokens : tokens} />
  </div>
  
</div>

<!-- Featured Section -->
<Section title="Featured Tracks" isCollapsable margin="2em 0">
  <div class="featured-wrapper">
    <FeaturedCard token="LOST" platforms={['LOST', 'PNG', 'JOE', 'SNOB', 'YAK']} description="Stake, Pool or Farm" />
    <FeaturedCard token="USDC.e" platforms={['LOST', 'PNG', 'JOE']} description="Stake, Pool or Farm" />
  </div>
</Section>

<!-- Portfolio Details -->
<Section title="Portfolio">
  {#if (ownWallet ? $store.tokens : tokens).length > 0}
    <div class="portfolioItems">
      {#each (ownWallet ? $store.tokens : tokens) as token}
        <PortfolioItem {token} {ownWallet} />
      {/each}
      {#each (ownWallet ? $store.projectBalances : projectBalances) as token}
        <PortfolioItem {token} {ownWallet} />
      {/each}
    </div>
  {:else}
    <div class="loading">
      <img src="/fihub.svg" alt="Loading..." height="50px" width="50px" />
      {#if fetching || (ownWallet && $store.connecting)}
        <p>Loading...</p>
      {:else}
        <p>Oops, something went wrong or {ownWallet ? 'you have' : 'this wallet has'} no tokens. Retry?</p>
        <Button on:click={() => setBalances({ refresh: true })}>Retry</Button>
      {/if}
    </div>
  {/if}
</Section>

<!-- #################################################################################################### -->

<style>

  div.overview-wrapper {
    display: flex;
    flex-direction: column;
    align-content: center;
    gap: 1em;
  }

  div.wallet {
    display: none;
    align-items: center;
    gap: 1.5em;
  }

  div.wallet > img {
    height: 5em;
    width: 5em;
  }

  div.info {
    display: flex;
    flex-direction: column;
    gap: .5em;
  }

  div.address {
    display: flex;
    align-items: center;
    gap: .7em;
  }

  div.address > i {
    cursor: pointer;
  }

  div.distribution {
    width: 100%;
  }

  div.featured-wrapper {
    display: flex;
    gap: 1.5em;
    overflow: auto hidden;
  }

  div.portfolioItems {
    display: flex;
    flex-direction: column;
    gap: 1em;
  }

  div.loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: .5em;
  }

  div.loading > img {
    height: 3em;
    width: 3em;
  }

  .small {
    font-size: .8em;
  }

  @media screen and (min-width: 600px) {
    div.overview-wrapper {
      flex-direction: row;
      justify-content: space-between;
    }
    div.wallet {
      display: flex;
    }
    div.distribution {
      width: 25em;
    }
  }

</style>
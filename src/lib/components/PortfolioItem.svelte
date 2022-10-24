<script lang="ts">

  // Imports:
  import { slide } from 'svelte/transition';
  import { availableTracks } from '$lib/tracks';
  import Pill from '$lib/components/Pill.svelte';
  import Button from '$lib/components/Button.svelte';
  import TokenLogo from '$lib/components/TokenLogo.svelte';

  // Type Imports:
  import type { NativeToken, Token, LPToken, DebtToken, XToken } from 'weaverfi/dist/types';

  // Initializations:
  export let token: NativeToken | Token | LPToken | DebtToken | XToken;
  export let ownWallet: boolean;
  let isCollapsed: boolean = true;

  // Reactive Track Availability:
  $: isAvailable = availableTracks.has(token.symbol);

</script>

<!-- #################################################################################################### -->

<div class="portfolioItem">
  <div class="token" class:clickable={ownWallet} on:click={() => isCollapsed = !isCollapsed}>
    <div class="tokenHeader">
      <TokenLogo symbol={token.symbol} />
      <h3>{token.symbol}</h3>
    </div>
    <div class="tokenDetails">
      <span>{token.balance.toLocaleString(undefined, { maximumFractionDigits: 3 })}</span>
      {#if token.type === 'lpToken'}
        <span class="small">${(token.token0.balance * token.token0.price) + (token.token1.balance * token.token1.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
      {:else if token.type === 'xToken'}
        <span class="small">${(token.underlyingToken.balance * token.underlyingToken.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
      {:else}
        <span class="small">${(token.balance * token.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
      {/if}
    </div>
    {#if ownWallet}
      <i class="icofont-rounded-{isCollapsed ? 'down' : 'up'}" />
    {/if}
  </div>
  {#if ownWallet && !isCollapsed}
    <div class="extraTokenInfo" transition:slide|local>
      {#if isAvailable}
        <Button icon="arrow-right" iconRight>{token.symbol} Track</Button>
      {:else}
        <Pill type="secondary" icon="exclamation-circle">Track Not Available Yet</Pill>
      {/if}
    </div>
  {/if}
</div>

<!-- #################################################################################################### -->

<style>

  div.portfolioItem {
    display: flex;
    flex-direction: column;
    background: var(--darkGreyBlue);
    border-radius: 1em;
    overflow: hidden;
  }

  div.token {
    display: flex;
    align-items: center;
    gap: 1em;
    padding: 1em;
  }

  div.token > i {
    color: var(--darkBlue);
  }

  div.tokenHeader {
    flex: 1;
    display: flex;
    align-items: center;
    gap: .5em;
  }

  div.tokenDetails {
    display: flex;
    flex-direction: column;
    align-items: end;
  }

  div.extraTokenInfo {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1em;
  }

  .small {
    font-size: .8em;
  }

</style>
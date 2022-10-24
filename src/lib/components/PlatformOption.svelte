<script lang="ts">

  // Imports:
  import Button from '$lib/components/Button.svelte';
  import TokenLogo from '$lib/components/TokenLogo.svelte';

  // Type Imports:
  import type { InteractionsListPlatform } from '$lib/types';

  // Initializations:
  export let option: InteractionsListPlatform;
  export let track: string;
  export let onSelect: Function;
  
</script>

<!-- #################################################################################################### -->

<div class="option">
  
  <!-- Header -->
  <div class="header">
    {#if option.token}
      <TokenLogo symbol={option.token} />
    {/if}
    <h2>{option.name}</h2>
    <!-- TODO - add APY/yield info on top right corner -->
  </div>

  <!-- Explanation -->
  <div class="explanation">
    <h3>What is {option.name}?</h3>
    <p>{option.description}</p>
  </div>

  <!-- Details -->
  <!-- TODO - check for and add custom strategy details -->

  <!-- Select Button -->
  <Button icon="arrow-right" iconRight on:click={() => onSelect()}>
    {#if track === 'stake'}
      Stake on {option.name}
    {:else if track === 'lp'}
      Provide Liquidity on {option.name}
    {:else if track === 'farm'}
      Farm on {option.name}
    {/if}
  </Button>

</div>

<!-- #################################################################################################### -->

<style>

  div.option {
    display: flex;
    flex-direction: column;
    gap: 1em;
    padding: 1.5em;
    background: var(--greyBlue);
    border-radius: 1em;
  }

  div.header {
    display: flex;
    align-items: center;
    gap: .5em;
    font-size: 1.5em;
  }

  h2 {
    font-size: 1em;
  }

  div.explanation {
    display: flex;
    flex-direction: column;
    gap: .5em;
    font-size: .9em;
  }

  div.explanation > p {
    white-space: pre-line;
  }

</style>
<script lang="ts">

  // Imports:
  import { options, whatIs } from '$lib/content';
  import Button from '$lib/components/Button.svelte';
  import YouTubeEmbed from '$lib/components/YouTubeEmbed.svelte';

  // Type Imports:
  import type { InteractionsListItemType } from '$lib/types';

  // Initializations:
  export let option: InteractionsListItemType;
  export let token: string;
  export let onSelect: Function;
  
</script>

<!-- #################################################################################################### -->

<div class="option">
  
  <!-- Title -->
  {#if option === 'stake'}
    <h2>Stake {token}</h2>
  {:else if option === 'lp'}
    <h2>Provide {token} Liquidity</h2>
  {:else if option === 'farm'}
    <h2>Farm {token}</h2>
  {/if}

  <!-- Explanation -->
  <div class="explanation">
    <h3>{options[option].question}</h3>
    <p>{whatIs[option]}</p>
    <div class="videoWrapper">
      <YouTubeEmbed id="{options[option].videoID}" title="FiHub Video Explainer: {options[option].title}" />
    </div>
  </div>

  <!-- Estimated Returns -->
  <!-- TODO - need info from defillama (https://yields.llama.fi/pools) and others -->

  <!-- Select Button -->
  <Button icon="arrow-right" iconRight color="var(--lightGreen)" on:click={() => onSelect()}>
    {#if option === 'stake'}
      Stake {token}
    {:else if option === 'lp'}
      Provide {token} Liquidity
    {:else if option === 'farm'}
      Farm {token}
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

  div.explanation {
    display: flex;
    flex-direction: column;
    gap: 1em;
  }

  div.explanation > p {
    white-space: pre-line;
  }

</style>
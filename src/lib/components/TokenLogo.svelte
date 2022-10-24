<script lang="ts">

  // Imports:
  import weaver from 'weaverfi';

  // Initializations:
  export let symbol: string;
  const defaultTokenLogo: string = 'https://place-hold.it/48x48?text=N/A';
  let logoErrored: boolean = false;

  $: tokenLogo = weaver.avax.getTokenLogo(symbol);

</script>

<!-- #################################################################################################### -->

{#if !logoErrored}
  <img src={tokenLogo} alt={symbol} on:error={() => logoErrored = true} />
{:else}
  <img src={defaultTokenLogo} alt={symbol} />
{/if}

<!-- #################################################################################################### -->

<style>

  img {
    height: 1.5em;
    width: 1.5em;
    border-radius: 50%;
  }

  @media screen and (min-width: 600px) {
    img {
      height: 2em;
      width: 2em;
    }
  }

</style>
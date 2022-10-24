<script lang="ts">

  // Type Imports:
  import type { InteractionsListToken } from '$lib/types';

  // Initializations:
  export let token: InteractionsListToken;
  
</script>

<!-- #################################################################################################### -->

<div class="tokenInfo">

  <!-- Title -->
  <h2>What is the {token.symbol} token?</h2>

  <!-- Description -->
  <p>{token.description}</p>

  <!-- Token Address -->
  <span class="addressHeader">
    <i class="icofont-info-circle" />
    <strong>Token Address</strong>
  </span>
  <span class="addressLink">
    <span>View on Snowtrace</span>
    <a href="https://snowtrace.io/token/{token.address}" target="_blank"><i class="icofont-external-link" /></a>
  </span>
  
</div>

<!-- #################################################################################################### -->

<style>

  div.tokenInfo {
    display: flex;
    flex-direction: column;
    gap: .5em;
  }

  p {
    margin-bottom: 1em;
  }

  span.addressHeader > i {
    margin-right: .2em;
  }

  span.addressLink i {
    margin-left: .2em;
    font-size: .9em;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

</style>
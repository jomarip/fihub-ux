<script lang="ts">

  // Type Imports:
  import type { InteractionsListPlatform } from '$lib/types';

  // Initializations:
  export let platform: InteractionsListPlatform;
  
</script>

<!-- #################################################################################################### -->

<div class="platformInfo">

  <!-- Title -->
  <h2>What is {platform.name}?</h2>

  <!-- Description -->
  <p>{platform.description}</p>

  <!-- Platform URL -->
  {#if platform.link}
    <span class="websiteHeader">
      <i class="icofont-world" />
      <strong>Website</strong>
    </span>
    <span class="websiteLink">
      <span>{platform.link}</span>
      <a href="{platform.link}" target="_blank"><i class="icofont-external-link" /></a>
    </span>
  {/if}
  
</div>

<!-- #################################################################################################### -->

<style>

  div.platformInfo {
    display: flex;
    flex-direction: column;
    gap: .5em;
  }

  p {
    margin-bottom: 1em;
  }

  span.websiteHeader > i {
    margin-right: .2em;
  }

  span.websiteLink i {
    margin-left: .2em;
    font-size: .9em;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

</style>
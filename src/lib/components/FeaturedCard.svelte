<script lang="ts">

  // Imports:
  import TokenLogo from '$lib/components/TokenLogo.svelte';

  // Initializations:
  export let token: string;
  export let platforms: string[];
  export let description: string | undefined = undefined;
  
</script>

<!-- #################################################################################################### -->

<a href="/track/{token}">

  <!-- Banner -->
  <div class="bg">
    <img src="/featured/{token}.png" alt="Featured Background" />
  </div>

  <!-- Platform Logos -->
  <div class="platforms">
    <div>
      {#each platforms as symbol}
        <TokenLogo {symbol} />
      {/each}
    </div>
  </div>

  <!-- Token Info -->
  <div class="tokenInfo">
    <p>{description}</p>
    <h3>{token} Token</h3>
  </div>

</a>

<!-- #################################################################################################### -->

<style>

  a {
    position: relative;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    height: 6em;
    width: 25em;
    padding: 0 .5em;
    color: white;
    border-radius: 1em;
    text-decoration: none;
    overflow: hidden;
  }

  div.bg {
    position: absolute;
    inset: 0;
  }

  div.bg > img {
    height: 100%;
    width: 100%;
    object-fit: cover;
    opacity: .75;
  }

  div.platforms {
    position: absolute;
    inset: .5em 0 auto auto;
  }

  div.platforms > div {
    display: inline-flex;
    gap: .5em;
    padding: .3em .5em .3em 1em;
    background: var(--darkBlue);
    border-radius: 2em 0 0 2em;
  }

  div.tokenInfo {
    display: flex;
    flex-direction: column;
    margin: .5em 0 0 1em;
    isolation: isolate;
  }

  div.tokenInfo > p {
    font-size: .8em;
  }

  div.tokenInfo > h3 {
    font-size: 1.5em;
    text-transform: uppercase;
  }

  @media screen and (max-width: 600px) {
    a {
      width: 90%;
    }
  }

</style>
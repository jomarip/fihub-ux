<script lang="ts">

  // Imports:
  import { store } from '$lib/stores';
  import { goto } from '$app/navigation';
  import Web3 from '$lib/Web3.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import Button from '$lib/components/Button.svelte';
  import YouTubeEmbed from '$lib/components/YouTubeEmbed.svelte';

  // Initializations:
  const coreExtensionLink = 'https://chrome.google.com/webstore/detail/core/agoakfejjabomempkjlepdflaleeobhb';
  const walletTutorialVideoID = 'eczkjrGG_As';
  let isHowToSetupWalletOpen: boolean = false;

  // Function to go to portfolio page:
  const goToPortfolio = (address: string | null) => {
    if(address) {
      goto(`/portfolio/${address}`);
    }
  }

</script>

<!-- #################################################################################################### -->

<!-- SvelteKit Dynamic Header -->
<svelte:head>
  <title>FiHub</title>
  <meta name="description" content="The hub for all things DeFi." />
</svelte:head>

<div class="wrapper">

  <!-- FiHub Station Logo -->
  <div id="station">
    <img src="/fihub-station.png" alt="Fihub station" width="500px" height="500px" />
  </div>

  <!-- Content -->
  <div id="content">
    <h1>Welcome to FiHub!</h1>
    <p class="subtitle">Expanding DeFi while onboarding the next <strong>1M users</strong>.</p>

    <!-- Web3 Component -->
    <Web3 let:connect let:switchToAvaxNetwork>
      {#if $store.address && $store.validChain}
        <Button on:click={() => goToPortfolio($store.address)} fontSize="1.3em">See Your Portfolio</Button>
      {:else if $store.address}
        <Button on:click={switchToAvaxNetwork} fontSize="1.3em">Switch to Avalanche Network</Button>
      {:else if $store.connecting}
        <Button fontSize="1.3em" disabled>Connecting...</Button>
      {:else}
        <Button on:click={connect} fontSize="1.3em">Connect Wallet</Button>
      {/if}
    </Web3>

    <!-- Wallet Tutorial Button -->
    {#if $store.address === null}
      <button class="setupTutorial" type="button" on:click={() => isHowToSetupWalletOpen = true}>How to setup a wallet?</button>
    {/if}

    <!-- Wallet Tutorial Modal -->
    <Modal isOpen={isHowToSetupWalletOpen} onClose={() => isHowToSetupWalletOpen = false} closeWithBackdrop>
      <svelte:fragment slot="header">
        <h2>How to setup a wallet</h2>
      </svelte:fragment>
      <svelte:fragment slot="body">
        <div class="videoWrapper">
          <YouTubeEmbed id={walletTutorialVideoID} />
        </div>
      </svelte:fragment>
      <svelte:fragment slot="action">
        <Button on:click={() => window.open(coreExtensionLink)} fontSize="1.2em">Install Core Wallet <img src="/resources/core.svg" height="1em" width="1em" alt="Core" /></Button>
      </svelte:fragment>
    </Modal>
    
  </div>
</div>

<!-- #################################################################################################### -->

<style>

  div.wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1.5em;
    width: 100%;
    margin-top: 5vh;
  }

  div.wrapper > div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  #station {
    padding: 0 1em;
  }

  #station > img {
    height: auto;
    width: min(500px, 100%);
  }

  h1 {
    margin-bottom: .2em;
    font-size: 2.5em;
  }

  p.subtitle {
    margin-bottom: 1em;
    font-size: 1.5em;
    text-align: center;
  }

  button.setupTutorial {
    margin-top: 1em;
    font-weight: lighter;
  }

  h2 {
    text-align: center;
  }

  div.videoWrapper {
    max-width: 720px;
    margin: 0 auto;
  }

  @media screen and (min-width: 600px) {
    div.wrapper {
      flex-direction: row;
      gap: 10em;
      margin-top: 15vh;
    }
    #station {
      padding: 0;
      order: 2;
    }
    #station > img {
      width: 500px;
    }
    #content {
      align-items: start;
    }
    h1 {
      margin: 0;
      font-size: 4em;
      text-align: left;
    }
    p.subtitle {
      font-size: 1.8em;
      text-align: left;
    }
  }

</style>
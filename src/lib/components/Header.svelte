<script lang="ts">

  // Imports:
  import { store } from '$lib/stores';
  import { addressShort } from '$lib/helpers';
  import Web3 from '$lib/Web3.svelte';
  import Button from '$lib/components/Button.svelte';
  import Dropdown from '$lib/components/Dropdown.svelte';

</script>

<!-- #################################################################################################### -->

<header>

  <!-- FiHub Logo -->
  <a id="logo" href="{$store.address ? `/portfolio/${$store.address}` : '/'}">
    <img src="/fihub.svg" alt="FiHub Logo" />
    <span>FiHub</span>
  </a>

  <!-- Web3 Component -->
  <Web3 let:connect let:disconnect>
    {#if $store.address}
      <Dropdown>
        <svelte:fragment slot="toggle">
          <!-- TODO - avatar should be generated from wallet address -->
          <img class="avatar" src="/avatar.svg" alt="Avatar" />
          <span title={$store.address}>{addressShort($store.address)}</span>
        </svelte:fragment>
        <svelte:fragment slot="menu">
          <!-- <a href="/" class="option" role="menuitem">Transactions <i class="icofont-navigation-menu" /></a> -->
          <button type="button" class="option" on:click={disconnect} role="menuitem">Logout <i class="icofont-logout" /></button>
        </svelte:fragment>
      </Dropdown>
    {:else if $store.connecting}
      <Button disabled>Connecting...</Button>
    {:else}
      <Button on:click={connect}>Connect Wallet</Button>
    {/if}
  </Web3>
  
</header>

<!-- #################################################################################################### -->

<style>

  header {
    position: fixed;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--headerHeight);
    width: 100%;
    padding: .5em 1em;
    background: var(--greyBlue);
    z-index: 10;
  }

  #logo {
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5em;
    font-weight: bold;
    text-decoration: none;
  }

  #logo > img {
    height: 2em;
  }

  #logo > span {
    margin-left: .3em;
  }

  img.avatar {
    height: 1.5em;
    width: 1.5em;
  }

  .option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: .2em .5em;
    color: black;
    background: var(--lightBlue);
    border-radius: .4em;
  }

  @media screen and (min-width: 600px) {
    header {
      padding: 0 10%;
    }
    #logo {
      font-size: 1.8em;
    }
    #logo > span {
      margin-left: .5em;
    }
  }

</style>
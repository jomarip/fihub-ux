<script lang="ts">

  // Imports:
  import { slide } from 'svelte/transition';
  import { clickOutside } from '$lib/helpers';
  import Button from '$lib/components/Button.svelte';

  // Initializations:
  let isOpen: boolean = false;

</script>

<!-- #################################################################################################### -->

<section use:clickOutside={() => isOpen = false}>

  <!-- Button -->
  <Button outline iconRight icon={isOpen ? 'rounded-up' : 'rounded-down'} on:click={() => isOpen = !isOpen}>
    <slot name="toggle" />
  </Button>

  <!-- Options -->
  {#if isOpen}
    <div role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1" transition:slide|local>
      <slot name="menu" />
    </div>
  {/if}
  
</section>

<!-- #################################################################################################### -->

<style>

  section {
    position: relative;
  }

  div {
    position: absolute;
    left: 0;
    display: flex;
    flex-direction: column;
    gap: .5em;
    width: 100%;
    margin-top: .5em;
    border-radius: 0 0 .5em .5em;
  }

</style>
<script lang="ts">

  // Imports:
  import { slide } from 'svelte/transition';
  import { Tooltip } from 'svelte-tooltip-simple';

  // Initializations:
  export let title: string;
  export let tooltip: string | undefined = undefined;
  export let size: 'normal' | 'small' = 'normal';
  export let center: boolean = false;
  export let isCollapsable: boolean = false;
  export let margin: string = '0';
  let isCollapsed: boolean = false;
  let marginCSS: string = `margin: ${margin};`;

  // Function to collapse section:
  const collapse = () => {
    if(isCollapsable) {
      isCollapsed = !isCollapsed;
    }
  }

</script>

<!-- #################################################################################################### -->

<section style="{marginCSS}">

  <!-- Header -->
  <header class:center class:isCollapsable on:click={collapse}>
    <h2>{title}</h2>
    {#if tooltip}
      <Tooltip>
        <i class="icofont-question-circle" class:smallSize={size === 'small'} />
        <svelte:fragment slot="content">{tooltip}</svelte:fragment>
      </Tooltip>
    {/if}
    {#if isCollapsable}
      <i class="icofont-rounded-{isCollapsed ? 'down' : 'up'}" class:smallSize={size === 'small'} />
    {/if}
  </header>

  <!-- Section Content -->
  {#if !isCollapsed}
    <div transition:slide|local>
      <slot />
    </div>
  {/if}
  
</section>

<!-- #################################################################################################### -->

<style>

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: .2em;
    padding-bottom: .2em;
    border-bottom: 1px solid white;
  }

  header.center {
    justify-content: center;
  }

  header.isCollapsable {
    cursor: pointer;
  }

  h2 {
    font-size: 1.2em;
  }

  i {
    height: 1em;
    width: 1em;
  }

  i.smallSize {
    height: .8em;
    width: .8em;
  }

  div {
    margin-top: 1.5em;
  }

  @media screen and (min-width: 600px) {
    h2 {
      font-size: 1.5em;
    }
  }

</style>
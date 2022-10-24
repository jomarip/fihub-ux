<script lang="ts">

  // Initializations:
  export let color: string = 'var(--lightBlue)';
  export let fontColor: string = 'var(--darkBlue)';
  export let outline: boolean = false;
  export let disabled: boolean = false;
  export let full: boolean = false;
  export let icon: string | undefined = undefined;
  export let iconRight: boolean = false;
  export let fontSize: string = '1em';
  let fontColorCSS = `color: ${outline ? color : fontColor};`;
  let fontSizeCSS = `font-size: ${fontSize};`;
  let colorCSS = `background-color: ${outline ? 'transparent' : color};`;
  let borderCSS = outline ? `border: 2px solid currentColor` : '';

</script>

<!-- #################################################################################################### -->

<button on:click type="button" class:full style="{colorCSS}{fontColorCSS}{fontSizeCSS}{borderCSS}" {disabled}>
  {#if icon && !iconRight}
    <i class="icofont-{icon}" />
  {/if}
  <slot />
  {#if icon && iconRight}
    <i class="icofont-{icon}" />
  {/if}
</button>

<!-- #################################################################################################### -->

<style>

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: .3em;
    padding: .4em 1em;
    font-weight: bold;
    border-radius: .5em;
  }

  button:disabled {
    cursor: not-allowed;
    filter: grayscale(.8);
  }

  button.full {
    width: 100%;
  }

</style>
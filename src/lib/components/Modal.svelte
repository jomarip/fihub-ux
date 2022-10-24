<script lang="ts">

  // Imports:
  import { fade } from 'svelte/transition';
  import Button from '$lib/components/Button.svelte';

  // Initializations:
  export let isOpen: boolean = false;
  export let closeWithCancel: boolean = false;
  export let closeWithBackdrop: boolean = false;
  export let onClose: Function = () => {};

  // Function to close modal:
  const close = () => {
    isOpen = false;
    onClose();
  }

  // Function to close modal on ESC key press:
  const closeOnEsc = (event: KeyboardEvent) => {
    if(isOpen && event.key === 'Escape') {
      close();
    }
  }

  // Function to close modal on backdrop click:
  const closeOnBackdrop = () => {
    if(closeWithBackdrop) {
      close();
    }
  }

</script>

<!-- #################################################################################################### -->

<!-- Svelte Window Bindings -->
<svelte:window on:keydown={closeOnEsc} />

{#if isOpen}
  <div class="fill" transition:fade={{ duration: 150 }}>

    <!-- Backdrop -->
    <div class="backdrop" on:click={closeOnBackdrop} />

    <!-- Modal -->
    <section>

      <!-- Modal Header -->
      <header>
        <slot name="header" />
        <button type="button" on:click={close}>
          <i class="icofont-ui-close" />
        </button>
      </header>

      <!-- Modal Body -->
      <div>
        <slot name="body" />
      </div>

      <!-- Close Mechanisms -->
      {#if closeWithCancel || $$slots.action}
        <footer>
          {#if closeWithCancel}
            <div>
              <Button full outline on:click={close}>Cancel</Button>
            </div>
          {/if}
          {#if $$slots.action}
            <div>
              <slot name="action" />
            </div>
          {/if}
        </footer>
      {/if}

    </section>
  </div>
{/if}

<!-- #################################################################################################### -->

<style>

  div.fill {
    position: fixed;
    inset: 0;
    padding: 1em;
    z-index: 11;
    overflow-y: scroll;
    overscroll-behavior-y: contain;
  }

  div.backdrop {
    position: fixed;
    inset: 0;
    background-color: #06041D;
    opacity: .7;
  }

  section {
    max-height: 80%;
    max-width: 60%;
    margin: 10vh auto 0;
    background: var(--darkBlue);
    border-radius: 1em;
    isolation: isolate;
  }

  section > div {
    padding: 1em 2em;
  }

  header {
    position: relative;
    display: flex;
    padding: 1em 2em;
    background: var(--greyBlue);
    border-radius: 1em 1em 0 0;
  }

  header > button {
    position: absolute;
    top: 0;
    right: 0;
    margin: 1em;
  }

  footer {
    display: flex;
    justify-content: center;
    gap: 1em;
    padding: 0 2em 1em;
  }

  footer > div {
    display: flex;
    flex: 1;
    justify-content: center;
  }

</style>
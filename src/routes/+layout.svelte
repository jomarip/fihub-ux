<script lang="ts">

  // Imports:
  import { SvelteToast } from '@zerodevx/svelte-toast';
  import Header from '$lib/components/Header.svelte';
  import '../app.css';

</script>

<!-- #################################################################################################### -->

<!-- Header -->
<Header />

<!-- App Content -->
<main>
  <SvelteToast />
  <slot />
</main>

<!-- #################################################################################################### -->

<style>

  main {
    margin-top: var(--headerHeight);
    padding: 2em 1em;
    overflow-x: hidden;
  }

  @media screen and (min-width: 600px) {
    main {
      padding: 2em 10%;
    }
  }

</style>
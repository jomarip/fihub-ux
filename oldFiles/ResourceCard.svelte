<script lang="ts">

  // Imports:
  import { goto } from '$app/navigation';
  import Pill from '$lib/components/Pill.svelte';
  import Button from '$lib/components/Button.svelte';

  // Initializations:
  export let title: string;
  export let description: string;
  export let tags: { name: string, type: 'primary' | 'secondary' }[] = [];
  export let readLink: string | undefined = undefined;
  export let watchLink: string | undefined = undefined;

</script>

<!-- #################################################################################################### -->

<article>

  <!-- Header -->
  <h3>{title}</h3>
  <p>{description}</p>

  <!-- Tags -->
  <div class="tags">
    {#each tags as tag}
      <Pill type={tag.type}>{tag.name}</Pill>
    {/each}
  </div>

  <!-- Links -->
  <div class="links">
    {#if readLink}
      <Button full color="green" icon="book" iconRight on:click={() => goto(readLink ?? '#')}>READ</Button>
    {/if}
    {#if watchLink}
      <Button full outline icon="play-alt-1" iconRight on:click={() => goto(watchLink ?? '#')}>WATCH</Button>
    {/if}
  </div>
  
</article>

<!-- #################################################################################################### -->

<style>

  article {
    padding: .5em;
    border-radius: 1em;
  }

  h3 {
    margin-bottom: .5em;
  }

  p {
    margin-bottom: 1em;
    font-size: .8em;
    line-clamp: 2;
  }

  div.tags {
    display: flex;
    gap: .5em;
    margin-bottom: 1em;
  }

  div.links {
    display: flex;
    gap: 1em;
  }

</style>
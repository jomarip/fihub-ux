<script lang="ts">

  // Imports:
  import YouTubeEmbed from '$lib/components/YouTubeEmbed.svelte';

  // Initializations:
  export let title: string;
  export let description: string;
  export let youtubeEmbedID: string;
  
</script>

<!-- #################################################################################################### -->

<article>
  <YouTubeEmbed id={youtubeEmbedID} />
  <h3>{title}</h3>
  <p>{description}</p>
</article>

<!-- #################################################################################################### -->

<style>

  article {
    border-radius: 2em;
  }

  h3 {
    margin: 1em 0 .5em;
  }

  p {
    font-size: .8em;
  }

</style>
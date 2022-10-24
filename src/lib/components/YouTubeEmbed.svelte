<script lang="ts">

  // Initializations:
  export let id: string;
  export let title: string = 'Fihub Video';
  const params: string = 'controls=1&start=0&modestbranding=0&rel=0&enablejsapi=1&color=white';

</script>

<!-- #################################################################################################### -->

{#if id !== ''}
  <div>
    <lite-youtube videoid={id} playlabel={title} {params} />
  </div>
{/if}

<!-- #################################################################################################### -->

<style>

  div {
    margin: 0 auto;
    border-radius: .5em;
    aspect-ratio: 16 / 9;
    overflow: hidden;
  }

</style>
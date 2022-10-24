<script>
  import GraphView from '../GraphView/index.svelte';
  import { findOrCreateStore } from '../../stores/store';
  import { onMount } from 'svelte';
  export let nodes;
  export let edges;
  export let width = 600;
  export let height = 600;
  export let background = false;
  const key = (Math.random() + 1).toString(36).substring(7);
  const svelvetStore = findOrCreateStore(key);
  const { widthStore, heightStore, nodesStore, derivedEdges } = svelvetStore;
  onMount(() => {
    svelvetStore.nodesStore.set(nodes);
    svelvetStore.edgesStore.set(edges);
    svelvetStore.widthStore.set(width);
    svelvetStore.heightStore.set(height);
    svelvetStore.backgroundStore.set(background);
  });
</script>

<div class="Svelvet" style={`width: ${$widthStore}px; height: ${$heightStore}px`}>
  <GraphView {nodesStore} {derivedEdges} {key} />
</div>

<style>
  .Svelvet {
    position: relative;
    overflow: hidden;
    display: grid;
    font-family: 'Segoe UI', sans-serif;
    background-color: white;
  }
</style>

<script>
  import SimpleBezierEdge from '../../Edges/SimpleBezierEdge.svelte';
  import StraightEdge from '../../Edges/StraightEdge.svelte';
  import EdgeAnchor from '../../Edges/EdgeAnchor.svelte';
  import Node from '../../Nodes/index.svelte';
  import { findOrCreateStore } from '../../stores/store';
  export let nodesStore;
  export let derivedEdges;
  export let key;
  const svelvetStore = findOrCreateStore(key);
  const { backgroundStore, widthStore, heightStore } = svelvetStore;
  const gridSize = 15;
  const dotSize = 10;
</script>

<div class={`Nodes Nodes-${key}`}>
  <div class={`Node Node-${key}`}>
    {#each $nodesStore as node}
      <Node {node} {key}>{node.data.label}</Node>
    {/each}
  </div>
</div>

<svg class={`Edges Edges-${key}`} viewBox="0 0 {$widthStore} {$heightStore}">
  <defs>
    <pattern
      id={`background-${key}`}
      x="0"
      y="0"
      width={gridSize}
      height={gridSize}
      patternUnits="userSpaceOnUse"
    >
      <circle
        id="dot"
        cx={gridSize / 2 - dotSize / 2}
        cy={gridSize / 2 - dotSize / 2}
        r="0.5"
        style="fill: gray"
      />
    </pattern>
  </defs>

  {#if $backgroundStore}
    <rect width="100%" height="100%" style="fill: url(#background-{key});" />
  {/if}

  <g>
    {#each $derivedEdges as edge}
      {#if edge.type === 'straight'}
        <StraightEdge {edge} />
      {:else}
        <SimpleBezierEdge {edge} />
      {/if}

      {#if !edge.noHandle}
        <EdgeAnchor x={edge.sourceX} y={edge.sourceY} />
        {#if !edge.arrow}
          <EdgeAnchor x={edge.targetX} y={edge.targetY} />
        {/if}
      {/if}
    {/each}
  </g>
</svg>

<style>
  .Nodes {
    position: absolute;
    width: 100%;
    height: 100%;
  }
  .Node {
    color: black; /* remove this once color is set to default via types */
    width: 100%;
    height: 100%;
  }
</style>

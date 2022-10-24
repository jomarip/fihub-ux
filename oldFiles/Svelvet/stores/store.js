import { writable, derived, get } from 'svelte/store';
const svelvetStores = {};
export function findOrCreateStore(key) {
  const existing = svelvetStores[key];
  if (existing) {
    return existing;
  }
  const coreSvelvetStore = {
    nodesStore: writable([]),
    edgesStore: writable([]),
    widthStore: writable(600),
    heightStore: writable(600),
    backgroundStore: writable(false),
    nodeSelected: writable(false),
    nodeIdSelected: writable(-1),
  };
  const nodeIdSelected = coreSvelvetStore.nodeIdSelected;
  const onNodeClick = (e, nodeID) => {
    get(nodesStore).forEach((node) => {
      if (node.id === get(nodeIdSelected)) {
        node.clickCallback?.(node);
      }
    });
  };
  const edgesStore = coreSvelvetStore.edgesStore;
  const nodesStore = coreSvelvetStore.nodesStore;
  // derive from nodesStore and edgesStore, pass in array value from each store
  // updates edgesStore with new object properties (edge,sourceX, edge.targetY, etc) for edgesArray
  // $nodesStore and its individual object properties are reactive to node.position.x and node.position.y
  // so derivedEdges has access to node.position.x and node.position.y changes inside of this function
  const derivedEdges = derived([nodesStore, edgesStore], ([$nodesStore, $edgesStore]) => {
    $edgesStore.forEach((edge) => {
      // any -> edge should follow type DerivedEdge, but we are assigning to a type Edge element so the typing meshes together
      let sourceNode; // any -> should follow type Node
      let targetNode; // any -> should follow type Node
      $nodesStore.forEach((node) => {
        if (edge.source === node.id) sourceNode = node;
        if (edge.target === node.id) targetNode = node;
      });
      if (sourceNode) {
        let left = sourceNode.position.x;
        let top = sourceNode.position.y;
        let middle = sourceNode.width / 2;
        edge.sourceX = left + middle;
        edge.sourceY = top + sourceNode.height;
      }
      if (targetNode) {
        let left = targetNode.position.x;
        let top = targetNode.position.y;
        let middle = targetNode.width / 2;
        edge.targetX = left + middle;
        edge.targetY = top;
      }
    });
    return [...$edgesStore];
  });
  const svelvetStore = {
    ...coreSvelvetStore,
    onNodeClick,
    derivedEdges,
  };
  svelvetStores[key] = svelvetStore;
  return svelvetStore;
}

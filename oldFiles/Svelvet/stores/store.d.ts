import type { Readable, Writable } from 'svelte/store';
import type { Node, Edge } from '../types/types';
interface CoreSvelvetStore {
  nodesStore: Writable<Node[]>;
  edgesStore: Writable<Edge[]>;
  widthStore: Writable<number>;
  heightStore: Writable<number>;
  backgroundStore: Writable<boolean>;
  nodeIdSelected: Writable<number>;
  nodeSelected: Writable<boolean>;
}
interface SvelvetStore extends CoreSvelvetStore {
  derivedEdges: Readable<Edge[]>;
  onNodeClick: (e: any, nodeID: number) => void;
}
export declare function findOrCreateStore(key: string): SvelvetStore;
export {};

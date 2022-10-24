
// Imports:
import { writable } from 'svelte/store';

// Type Imports:
import type { Web3Store } from '$lib/types';

/* ========================================================================================================================================================================= */

// Default Web3 Store:
const defaultWeb3Store: Web3Store = {
  address: null,
  connecting: false,
  validChain: false,
  modal: undefined,
  provider: undefined,
  tokens: [],
  projectBalances: [],
  web3: undefined
}

/* ========================================================================================================================================================================= */

// Web3 Store:
export const store = writable<Web3Store>(defaultWeb3Store);

// Type Imports:
import type { ABI } from 'weaverfi/dist/types';

/* ========================================================================================================================================================================= */

// Basic ERC-20 ABI:
export const erc20ABI: ABI = [
  { constant: true, inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], name: "allowance", outputs: [{ name: "", type: "uint256" }], type: "function" },
  { constant: false, inputs: [{ name: "spender", type: "address" }, { name: "value", type: "uint256" }], name: "approve", outputs: [], type: "function" }
];

/* ========================================================================================================================================================================= */

// Basic DEX Router ABI:
export const dexABI: ABI = [
  { constant: true, inputs: [{ name: "amountIn", type: "uint256" }, { name: "path", type: "address[]" }], name: "getAmountsOut", outputs: [{ name: "amounts", type: "uint256[]" }], type: "function" }
]
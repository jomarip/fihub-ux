
// Imports:
import weaver from 'weaverfi';

// Type Imports:
import type { Address } from 'weaverfi/dist/types';

// Matching Function:
export const match = (param: Address) => {
  return weaver.eth.isAddress(param);
}
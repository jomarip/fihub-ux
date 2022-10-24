
// Imports:
import { ethers } from 'ethers';
import { browser } from '$app/env';
import { erc20ABI } from '$lib/ABIs';
import { minABI } from 'weaverfi/dist/ABIs';
import weaver from 'weaverfi';

// Type Imports:
import type { Chain, Address } from 'weaverfi/dist/types';

// Initializations:
export const nativeAddress: Address = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

/* ========================================================================================================================================================================= */

// Function to scroll to top of page:
export const scrollToTop = () => {
  if(browser) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/* ========================================================================================================================================================================= */

// Function to shorten addresses:
export const addressShort = (address: string) => {
  return `${address.substring(0, 5)}..${address.substring(38)}`;
}

/* ========================================================================================================================================================================= */

// Function to handle clicking outside of a given element:
export const clickOutside = (node: HTMLElement, handler: () => void): { destroy: () => void } => {
  const onClick = (event: MouseEvent) =>
    node && !node?.contains(event.target as HTMLElement) && !event.defaultPrevented && handler();

  document.addEventListener('click', onClick, true);

  return {
    destroy() {
      document.removeEventListener('click', onClick, true);
    },
  };
}

/* ========================================================================================================================================================================= */

// Function to get token balance:
export const getTokenBalance = async (wallet: Address, token: Address, decimals: number, network: Chain) => {
  const rawBalance = parseInt(await weaver[network].query(token, minABI, 'balanceOf', [wallet]));
  const balance = rawBalance / (10 ** decimals);
  return balance;
}

/* ========================================================================================================================================================================= */

// Function to approve token expenditure:
export const approveToken = async (token: Address, contract: Address, amount: ethers.BigNumber) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const tokenContract = new ethers.Contract(token, erc20ABI, signer);
  const tx: ethers.ContractTransaction = await tokenContract.approve(contract, amount.toString());
  const receipt = await tx.wait();
  return receipt;
}
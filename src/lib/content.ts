
// Type Imports:
import type { InteractionsListItemType } from '$lib/types';

/* ========================================================================================================================================================================= */

// Options Content:
export const options: Record<InteractionsListItemType, { title: string, question: string, videoID: string }> = {
  stake: {
    title: `Staking`,
    question: `What is staking?`,
    videoID: `oqtJ8E0bVyI`
  },
  lp: {
    title: `Liquidity Pools`,
    question: `What are liquidity pools?`,
    videoID: `CpdYhgCvzss`
  },
  farm: {
    title: `Yield Farming`,
    question: `What is yield farming?`,
    videoID: `` // <TODO>
  },
  autocompound: {
    title: `Auto-Compounding`,
    question: `What is auto-compounding?`,
    videoID: `` // <TODO>
  },
  lend: {
    title: `Lending`,
    question: `What is lending?`,
    videoID: `` // <TODO>
  },
  mint: {
    title: `Minting`,
    question: `What is minting?`,
    videoID: `` // <TODO>
  }
}

/* ========================================================================================================================================================================= */

// What Is ... Content:
export const whatIs: Record<InteractionsListItemType, string> = {
  stake: `Staking refers to depositing or locking a token for some financial incentive.\n\nThis is generally a very safe endeavour, where the only usual risk exposure is the price action of the token you are staking. Different platforms can adopt many different methods of rewarding stakers, either through token emissions, revenue sharing or any number of other methodologies.`,
  lp: `Liquidity pools are how decentralised exchanges find the liquidity to offer traders a way to swap between any two tokens.\n\nWhen you provide liquidity to a liquidity pool, you are depositing at least two different tokens in the pool and given an LP token as a receipt. When deposited, you are exposed to the price action of each token, as well as impermanent loss. At the same time, you are earning a portion of swap fees accrued through traders swapping tokens with the liquidity you've provided. Decentralised exchanges might also offer extra incentives in order to attract liquidity.`,
  farm: ``, // <TODO>
  autocompound: ``, // <TODO>
  lend: ``, // <TODO>
  mint: `` // <TODO>
}
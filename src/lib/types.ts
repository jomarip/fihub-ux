
// Type Imports:
import type { ethers } from 'ethers';
import type { Address, NativeToken, Token, LPToken, DebtToken, XToken, ExtendedABIEntry } from 'weaverfi/dist/types';
import type Web3Modal from 'web3modal';

/* ========================================================================================================================================================================= */

// Action Status Types:
export type ActionStatus = 'transacting' | 'loading' | `missingBalance${number | ''}` | 'ready' | `needsApproval${number | ''}`;

// Interactions List Item Type:
export type InteractionsListItemType = 'stake' | 'lp' | 'farm' | 'autocompound' | 'lend' | 'mint';

/* ========================================================================================================================================================================= */

// Web3 Store Interface:
export interface Web3Store {
  address: Address | null
  connecting: boolean
  validChain: boolean
  modal: Web3Modal | undefined
  provider: any
  tokens: (NativeToken | Token)[]
  projectBalances: (NativeToken | Token | LPToken | DebtToken | XToken)[]
  web3: ethers.providers.Web3Provider | undefined
}

/* ========================================================================================================================================================================= */

// Smart Contract List Interfaces:
export interface SmartContractList {
  name: string
  logoURI?: string
  keywords: string[]
  tags: Record<string, SmartContractListTag>
  timestamp: number
  smartContractsInfo: SmartContractInfo[]
  version: SmartContractListVersion
}
export interface SmartContractListTag {
  name: string
  description: string
}
export interface SmartContractListVersion {
  major: number
  minor: number
  patch: number
}
export interface SmartContractInfo {
  chainId: number
  address: Address
  proxyAddress?: Address
  platform: string
  name: string
  symbol?: string
  decimals?: number
  maxMint?: boolean
  logoURI?: string
  tags: string[]
  extensions?: Partial<SmartContractExtensions>
}
export interface SmartContractExtensions {
  abi: Record<string, SmartContractABI>
  ownerAddress: Address
  ownerIsMultisig: boolean
}
export interface SmartContractABI extends ExtendedABIEntry {
  audited?: boolean
  verified?: boolean
  auditors?: string[]
}

/* ========================================================================================================================================================================= */

// Interactions List Interfaces:
export interface InteractionsList {
  chainId: number
  token: InteractionsListToken
  routes: Record<string, InteractionsListRoute[]>
  interactions: InteractionsListItem[]
  platforms: InteractionsListPlatform[]
}
export interface InteractionsListToken {
  symbol: string
  address: Address
  platform?: string
  description?: string
}
export interface InteractionsListPlatform {
  name: string
  token?: string
  description?: string
  link?: string
}
export interface InteractionsListRoute {
  type: InteractionsListItemType
  platform: string
}
export interface InteractionsListItem {
  type: InteractionsListItemType
  platform: string
  tokens: InteractionsListToken[]
  contract: Address
  method: string
  poolId?: number
}

/* ========================================================================================================================================================================= */

// Track GPS Interface:
export interface TrackGPS {
  location: InteractionsListRoute | undefined
  possibleRoutes: Record<string, InteractionsListRoute[]>
}
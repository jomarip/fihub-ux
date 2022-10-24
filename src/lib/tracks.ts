
// Imports:
import { ethers } from 'ethers';
import { nativeAddress } from '$lib/helpers';

// Type Imports:
import type { Address, ABI } from 'weaverfi/dist/types';
import type { InteractionsList, SmartContractList, SmartContractInfo, InteractionsListRoute, InteractionsListItem, TrackGPS } from "$lib/types";

/* ========================================================================================================================================================================= */

// Available Tracks:
export const availableTracks: Set<string> = new Set([
  'LOST'
]);

/* ========================================================================================================================================================================= */

// Function to format transaction arguments for any interaction:
export const formatArgs = (interaction: InteractionsListItem, wallet: Address, values: number[], decimals: number[]) => {

  // Initializations:
  const txArgs: any[] = [];
  const platform = interaction.platform;
  const poolId = interaction.poolId;
  const tokens = interaction.tokens;
  const method = interaction.method;

  if(tokens.length > 0 && values.length > 0 && values.length === decimals.length) {

    // Auto-Compounding:
    if(interaction.type === 'autocompound') {
      const amountToAutocompound = ethers.utils.parseUnits(values[0].toString(), decimals[0]);
      if(platform === 'Yield Yak' && poolId !== undefined) {
        txArgs.push(poolId, amountToAutocompound);
      } else if(platform === 'Snowball') {
        txArgs.push(amountToAutocompound);
      }
      
    // Farming:
    } else if(interaction.type === 'farm') {
      const amountToFarm = ethers.utils.parseUnits(values[0].toString(), decimals[0]);
      if(platform === 'Pangolin' && poolId !== undefined) {
        txArgs.push(poolId, amountToFarm, wallet);
      }
  
    // Lending:
    } else if(interaction.type === 'lend') {
      const amountToLend = ethers.utils.parseUnits(values[0].toString(), decimals[0]);
      if(platform === 'Aave') {
        txArgs.push(tokens[0].address, amountToLend, wallet, 0);
      }
  
    // Providing Liquidity:
    } else if(interaction.type === 'lp' && tokens.length > 1 && values.length > 1) {
      const token1AmountToProvide = ethers.utils.parseUnits(values[0].toString(), decimals[0]);
      const token2AmountToProvide = ethers.utils.parseUnits(values[1].toString(), decimals[1]);
      const minToken1Amount = ethers.utils.parseUnits((values[0] * 0.995).toString(), decimals[0]);
      const minToken2Amount = ethers.utils.parseUnits((values[1] * 0.995).toString(), decimals[1]);
      const deadline = ethers.BigNumber.from(Math.floor(Date.now() / 1000) + 120);
      if(platform === 'Pangolin' || platform === 'Trader Joe') {
        const addLiquidityArgs = [tokens[0].address, tokens[1].address, token1AmountToProvide, token2AmountToProvide, minToken1Amount, minToken2Amount, wallet, deadline];
        const nativeAddLiquidityArgs = [tokens[1].address, token2AmountToProvide, minToken2Amount, minToken1Amount, wallet, deadline, { value: token1AmountToProvide }];
        method === 'addLiquidityAVAX' ? txArgs.push(...nativeAddLiquidityArgs) : txArgs.push(...addLiquidityArgs);
      }
  
    // Minting:
    } else if(interaction.type === 'mint') {
      const amountToDeposit = ethers.utils.parseUnits(values[0].toString(), decimals[0]);
      if(platform === 'Hubble') {
        txArgs.push(wallet, amountToDeposit);
      }
  
    // Staking:
    } else if(interaction.type === 'stake') {
      const amountToStake = ethers.utils.parseUnits(values[0].toString(), decimals[0]);
      if(platform === 'Lost Worlds' || platform === 'Snowball') {
        txArgs.push(amountToStake);
      }
    }

  }

  if(txArgs.length > 0) {
    return txArgs;
  } else {
    console.error('Invalid TX arguments: Would likely lead to a failed transaction.');
    return undefined;
  }
}

/* ========================================================================================================================================================================= */

// Function to get smart contract list:
export const getSmartContractList = async () => {
  const rawFile = await fetch(`/lists/scList.json`);
  const smartContractList: SmartContractList = await rawFile.json();
  return smartContractList;
}

// Function to get interactions list:
export const getInteractionsList = async (track: string) => {
  const rawFile = await fetch(`/lists/${track}.json`);
  const interactionsList: InteractionsList = await rawFile.json();
  return interactionsList;
}

/* ========================================================================================================================================================================= */

// Function to get all interaction-relevant smart contract info from smart contract list:
export const getAllContractInfo = async (interactionsList: InteractionsList) => {
  const allContractInfo: Record<Address, SmartContractInfo> = {};
  const smartContractList = await getSmartContractList();
  interactionsList.interactions.forEach(interaction => {

    // Fetching Contract Info:
    if(allContractInfo[interaction.contract.toLowerCase() as Address] === undefined) {
      const contractInfo = getContractInfo(smartContractList, interactionsList.chainId, interaction.contract);
      if(contractInfo) {
        allContractInfo[interaction.contract.toLowerCase() as Address] = contractInfo;
      } else {
        console.warn(`${interactionsList.token.symbol} Track Contract Info Not Found: ${interaction.contract}`);
      }
    }

    // Fetching Token Contract Info:
    interaction.tokens.forEach(token => {
      if(token.address.toLowerCase() !== nativeAddress && allContractInfo[token.address.toLowerCase() as Address] === undefined) {
        const tokenContractInfo = getContractInfo(smartContractList, interactionsList.chainId, token.address);
        if(tokenContractInfo) {
          allContractInfo[token.address.toLowerCase() as Address] = tokenContractInfo;
        } else {
          console.warn(`${interactionsList.token.symbol} Track Token Contract Info Not Found: ${token.address}`);
        }
      }
    });

  });
  return allContractInfo;
}

// Function to get smart contract info from smart contract list:
export const getContractInfo = (smartContractList: SmartContractList, chainId: number, contract: Address) => {
  const contractInfo = smartContractList.smartContractsInfo.find(listContract => listContract.chainId === chainId && listContract.address.toLowerCase() === contract.toLowerCase());
  return contractInfo;
}

// Function to format ABI from contract info:
export const formatContractABI = (data: { chainId: number, interaction: InteractionsListItem | undefined, contract: SmartContractInfo | undefined }) => {
  const formattedABI: ABI = [];
  if(data.interaction && data.contract && data.contract.extensions && data.contract.extensions.abi) {
    const ABI = data.contract.extensions.abi[data.interaction.method];
    if(ABI) {
      formattedABI.push({ inputs: ABI.inputs, name: ABI.name, outputs: ABI.outputs, stateMutability: ABI.stateMutability, type: ABI.type });
    } else {
      console.warn(`Could not locate ABI for ${data.interaction.method} on ${data.contract.address}. Check if there are the ABI is present or if capitalization isn't inconsistent.`);
    }
  }
  return formattedABI;
}

/* ========================================================================================================================================================================= */

// Function to determine track position:
export const trackGPS = (trackTaken: string[], list: InteractionsList): TrackGPS => {
  if(list && trackTaken.length > 0) {

    // Initializations:
    const interactionTypes = ['stake', 'lp', 'farm', 'autocompound'];
    const possibleRoutes: Record<string, InteractionsListRoute[]> = {};
    let location: InteractionsListRoute | undefined = undefined;

    // Populating Possible Routes:
    Object.keys(list.routes).forEach(route => {
      possibleRoutes[route] = [];
      list.routes[route].forEach(interaction => {
        possibleRoutes[route].push({ type: interaction.type, platform: interaction.platform });
      });
    });

    // Filtering Routes:
    for(let i = 0; i < trackTaken.length; i++) {

      // Filtering Type:
      if(interactionTypes.includes(trackTaken[i])) {
        Object.keys(possibleRoutes).forEach(route => {
          if(possibleRoutes[route][0].type !== trackTaken[i]) {
            delete possibleRoutes[route];
          }
        });

      // Filtering Platform:
      } else if(i > 0 && interactionTypes.includes(trackTaken[i - 1])) {
        Object.keys(possibleRoutes).forEach(route => {
          if(possibleRoutes[route][0].platform !== trackTaken[i]) {
            delete possibleRoutes[route];
          } else {
            location = possibleRoutes[route].shift();
            if(possibleRoutes[route].length === 0) {
              delete possibleRoutes[route];
            }
          }
        });
      }
    }

    return { location, possibleRoutes };
  } else {
    return { location: undefined, possibleRoutes: {} };
  }
}

/* ========================================================================================================================================================================= */

// Function to get interaction details:
export const getInteractionDetails = (list: InteractionsList, contractInfo: Record<Address, SmartContractInfo>, location: InteractionsListRoute) => {
  const chainId = list.chainId;
  const interaction = list.interactions.find(interaction => interaction.type === location.type && interaction.platform === location.platform);
  const contract = interaction ? contractInfo[interaction.contract.toLowerCase() as Address] : undefined;
  return { chainId, interaction, contract };
}
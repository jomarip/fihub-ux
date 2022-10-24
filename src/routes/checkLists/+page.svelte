<script lang="ts">

  // Imports:
  import { onMount } from 'svelte';
  import { availableTracks, getSmartContractList, getInteractionsList } from '$lib/tracks';

  // Type Imports:
  import type { SmartContractList, InteractionsList, InteractionsListItemType } from '$lib/types';

  // Interaction Types:
  const interactionTypes: Record<InteractionsListItemType, null> = { 'stake': null, 'lp': null, 'farm': null, 'autocompound': null, 'lend': null, 'mint': null };

  // Smart Contract List Checks Interfaces:
  interface SmartContractListStatus {
    name: boolean
    logoURI: boolean
    keywords: boolean
    tags: boolean
    timestamp: boolean
    smartContractsInfo: SmartContractsInfoStatus[]
    version: boolean
  }
  interface SmartContractsInfoStatus {
    chainId: boolean
    address: boolean
    proxyAddress: boolean
    platform: boolean
    name: boolean
    symbol: boolean
    decimals: boolean
    maxMint: boolean
    logoURI: boolean
    tags: boolean
    extensions: SmartContractExtensionsStatus
  }
  interface SmartContractExtensionsStatus {
    abi: boolean[]
    ownerAddress: boolean
    ownerIsMultisig: boolean
  }

  // Interactions List Checks Interface:
  interface InteractionsListStatus {
    listName: string
    chainId: boolean
    token: boolean
    routes: boolean[]
    interactions: InteractionsListItemStatus[]
    platforms: boolean[]
  }
  interface InteractionsListItemStatus {
    type: boolean
    platform: boolean
    tokens: boolean[]
    contract: boolean
    method: boolean
    poolId: boolean
  }

  // Variable Types:
  type VarType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'address' | 'interactionType';

  // Initializations:
  const smartContractListStatus: SmartContractListStatus = {
    name: false,
    logoURI: false,
    keywords: false,
    tags: false,
    timestamp: false,
    smartContractsInfo: [],
    version: false
  }
  let interactionsListStatus: InteractionsListStatus[] = [];

  // Function to check all interactions and smart contract lists:
  const checkLists = async () => {

    // Checking Smart Contract List:
    const smartContractList = await getSmartContractList();
    checkSmartContractList(smartContractList);

    // Checking All Interaction Lists:
    for(const track of Array.from(availableTracks)) {
      const interactionsList = await getInteractionsList(track);
      checkInteractionsList(interactionsList);
    }

  }

  // Function to check integrity of a smart contract list:
  const checkSmartContractList = (list: SmartContractList) => {

    // Name Check:
    smartContractListStatus.name = validate(list.name, 'string');

    // Logo URI Check:
    smartContractListStatus.logoURI = validate(list.logoURI, 'string', { optional: true });

    // Keywords Check:
    if(validate(list.keywords, 'array')) {
      smartContractListStatus.keywords = list.keywords.every(keyword => validate(keyword, 'string'));
    }
    
    // Tags Check:
    if(validate(list.tags, 'object')) {
      smartContractListStatus.tags = Object.keys(list.tags).every(tag => validate(list.tags[tag], 'object') && validate(list.tags[tag].name, 'string') && validate(list.tags[tag].description, 'string'));
    }

    // Timestamp Check:
    smartContractListStatus.timestamp = validate(list.timestamp, 'number');

    // Info Check:
    list.smartContractsInfo.forEach(contract => {

      // Initializing Info Status:
      const infoStatus: SmartContractsInfoStatus = {
        chainId: false,
        address: false,
        proxyAddress: false,
        platform: false,
        name: false,
        symbol: false,
        decimals: false,
        maxMint: false,
        logoURI: false,
        tags: false,
        extensions: {
          abi: [],
          ownerAddress: false,
          ownerIsMultisig: false
        }
      }

      // Chain ID Check:
      infoStatus.chainId = validate(contract.chainId, 'number');

      // Address Check:
      infoStatus.address = validate(contract.address, 'address');

      // Proxy Address Check:
      infoStatus.proxyAddress = validate(contract.proxyAddress, 'address', { optional: true });

      // Platform Check:
      infoStatus.platform = validate(contract.platform, 'string');

      // Name Check:
      infoStatus.name = validate(contract.name, 'string');

      // Symbol Check:
      infoStatus.symbol = validate(contract.symbol, 'string', { optional: true });

      // Decimals Check:
      infoStatus.decimals = validate(contract.decimals, 'number', { optional: true });

      // Max Mint Check:
      infoStatus.maxMint = validate(contract.maxMint, 'boolean', { optional: true });

      // Logo URI Check:
      infoStatus.logoURI = validate(contract.logoURI, 'string', { optional: true });

      // Tags Check:
      if(validate(contract.tags, 'array')) {
        infoStatus.tags = contract.tags.every(tag => validate(tag, 'string'));
      }

      // Extensions Check:
      if(contract.extensions) {

        // ABI Check:
        if(contract.extensions.abi) {
          Object.keys(contract.extensions.abi).forEach(key => {
            if(contract.extensions && contract.extensions.abi) {
              const entry = contract.extensions.abi[key];
              let isValidEntry: boolean = false;
              if(validate(entry.audited, 'boolean', { optional: true })) {
                if(validate(entry.verified, 'boolean', { optional: true })) {
                  if(validate(entry.auditors, 'array', { optional: true }) && (entry.auditors === undefined || entry.auditors.every(auditor => validate(auditor, 'string')))) {
                    if(validate(entry.inputs, 'array') && entry.inputs.every(input => validate(input, 'object'))) {
                      if(validate(entry.name, 'string')) {
                        if(validate(entry.outputs, 'array') && entry.outputs.every(output => validate(output, 'object'))) {
                          if(validate(entry.stateMutability, 'string')) {
                            if(entry.type === 'function') {
                              isValidEntry = true;
                            } else {
                              console.warn(`Ensure ABI method types are set to 'function'.`);
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
              infoStatus.extensions.abi.push(isValidEntry);
            }
          });
        }
  
        // Owner Address Check:
        infoStatus.extensions.ownerAddress = validate(contract.extensions.ownerAddress, 'address', { optional: true });
  
        // Owner Is Multisig Check:
        infoStatus.extensions.ownerIsMultisig = validate(contract.extensions.ownerIsMultisig, 'boolean', { optional: true });

      } else {
        infoStatus.extensions.ownerAddress = true;
        infoStatus.extensions.ownerIsMultisig = true;
      }

      smartContractListStatus.smartContractsInfo = [...smartContractListStatus.smartContractsInfo, infoStatus];
    });

    // Version Check:
    smartContractListStatus.version = validate(list.version, 'object') && validate(list.version.major, 'number') && validate(list.version.minor, 'number') && validate(list.version.patch, 'number');
    
  }

  // Function to check integrity of a smart contract list:
  const checkInteractionsList = (list: InteractionsList) => {
    
    // Initializing List Status:
    const listStatus: InteractionsListStatus = {
      listName: list.token.symbol,
      chainId: false,
      token: false,
      routes: [],
      interactions: [],
      platforms: []
    }

    // Chain ID Check:
    listStatus.chainId = validate(list.chainId, 'number');

    // Token Check:
    if(validate(list.token, 'object') && validate(list.token.address, 'address') && validate(list.token.platform, 'string', { optional: true }) && validate(list.token.symbol, 'string') && validate(list.token.description, 'string', { optional: true })) {
      if(list.token.platform !== undefined) {
        const includedPlatformInfo = list.platforms.find(platform => platform.name === list.token.platform);
        if(includedPlatformInfo !== undefined) {
          listStatus.token = true;
        } else {
          console.warn(`Could not find token's platform info: ${list.token.platform}`);
        }
      } else {
        listStatus.token = true;
      }
    }

    // Routes Check:
    if(validate(list.routes, 'object')) {
      Object.keys(list.routes).forEach(route => {
        if(validate(list.routes[route], 'array')) {
          listStatus.routes.push(list.routes[route].every(item => validate(item.type, 'string') && validate(item.platform, 'string')));
        } else {
          listStatus.routes.push(false);
        }
      });
    } else {
      listStatus.routes.push(false);
    }

    // Interactions Check:
    if(validate(list.interactions, 'array')) {
      list.interactions.forEach(interaction => {

        // Initializing Interaction Status:
        const interactionStatus: InteractionsListItemStatus = {
          type: false,
          platform: false,
          tokens: [],
          contract: false,
          method: false,
          poolId: false
        }

        // Type Check:
        interactionStatus.type = validate(interaction.type, 'interactionType');

        // Platform Check:
        if(validate(interaction.platform, 'string')) {
          const includedPlatformInfo = list.platforms.find(platform => platform.name === list.token.platform);
          if(includedPlatformInfo !== undefined) {
            interactionStatus.platform = true;
          } else {
            console.warn(`Could not find interaction's platform info: ${interaction.platform}`);
          }
        }

        // Tokens Check:
        if(validate(interaction.tokens, 'array') && (interaction.type === 'lp' ? interaction.tokens.length > 1 : interaction.tokens.length > 0)) {
          interactionStatus.tokens.push(interaction.tokens.every(token => validate(token.symbol, 'string') && validate(token.address, 'address') && validate(token.description, 'string', { optional: true })));
        } else {
          interactionStatus.tokens.push(false);
          console.warn(`Interaction's token array is either invalid or has too few entries (lp interactions require 2 tokens).`);
        }

        // Contract Check:
        interactionStatus.contract = validate(interaction.contract, 'address');

        // Method Check:
        interactionStatus.method = validate(interaction.method, 'string');

        // Pool ID Check:
        if(interaction.type === 'farm') {
          if(validate(interaction.poolId, 'number')) {
            interactionStatus.poolId = true;
          } else {
            console.warn(`Interactions of type ${interaction.type} need to have a poolId!`);
          }
        } else {
          interactionStatus.poolId = validate(interaction.poolId, 'number', { optional: true });
        }

        listStatus.interactions.push(interactionStatus);
      });
    } else {
      listStatus.interactions.push({ type: false, platform: false, tokens: [false], contract: false, method: false, poolId: false });
    }

    // Platforms Check:
    if(validate(list.platforms, 'array')) {
      list.platforms.forEach(platform => {
        let isValidEntry: boolean = false;
        if(validate(platform.name, 'string')) {
          if(validate(platform.token, 'string', { optional: true })) {
            if(validate(platform.description, 'string', { optional: true })) {
              if(validate(platform.link, 'string', { optional: true })) {
                isValidEntry = true;
              }
            }
          }
        }
        listStatus.platforms.push(isValidEntry);
      });
    } else {
      listStatus.platforms.push(false);
    }

    interactionsListStatus = [...interactionsListStatus, listStatus];
  }

  // Function to validate any value type:
  const validate = (value: any, type: VarType, options?: { optional?: boolean }): boolean => {
    if(options && options.optional && value === undefined) {
      return true;
    } else if(value !== undefined) {
      let isValid: boolean = false;
      if(type === 'string') {
        isValid = typeof value === 'string' && value !== '';
      } else if(type === 'array') {
        isValid = Array.isArray(value);
      } else if(type === 'address') {
        isValid = validate(value, 'string') && value.length === 42 && value.startsWith('0x');
      } else if(type === 'interactionType') {
        isValid = validate(value, 'string') && Object.keys(interactionTypes).includes(value);
      } else if(type === typeof value) {
        isValid = true;
      }
      if(!isValid) {
        if(type === 'string' || type === 'address') {
          console.warn(`Invalid ${type}: "${value}"`);
        } else {
          console.warn(`Invalid ${type}: ${value}`);
        }
      }
      return isValid;
    }
    console.warn(`Undefined ${type}.`);
    return false;
  }

  onMount(() => {
    checkLists();
  });

</script>

<!-- #################################################################################################### -->

<!-- SvelteKit Dynamic Header -->
<svelte:head>
  <title>FiHub | List Checks</title>
  <meta name="description" content="The hub for all things DeFi. This endpoint can be used to check all existing interactions and smart contract lists in the app." />
</svelte:head>

<div class="wrapper">

  <!-- Smart Contract List Status -->
  <section id="smartContractList">
    <h2>Smart Contract List Status:</h2>
    <span>Name: <i class="icofont-{smartContractListStatus.name ? 'ui-check green' : 'ui-close red'}" /></span>
    <span>Logo URI: <i class="icofont-{smartContractListStatus.logoURI ? 'ui-check green' : 'ui-close red'}" /></span>
    <span>Keywords: <i class="icofont-{smartContractListStatus.keywords ? 'ui-check green' : 'ui-close red'}" /></span>
    <span>Tags: <i class="icofont-{smartContractListStatus.tags ? 'ui-check green' : 'ui-close red'}" /></span>
    <span>Timestamp: <i class="icofont-{smartContractListStatus.timestamp ? 'ui-check green' : 'ui-close red'}" /></span>
    <span>Contract Info:</span>
    {#each smartContractListStatus.smartContractsInfo as contractInfo, i}
      <div class="subsection">
        <span>Contract {i + 1}:</span>
        <span>Chain ID: <i class="icofont-{contractInfo.chainId ? 'ui-check green' : 'ui-close red'}" /></span>
        <span>Address: <i class="icofont-{contractInfo.address ? 'ui-check green' : 'ui-close red'}" /></span>
        <span>Proxy Address: <i class="icofont-{contractInfo.proxyAddress ? 'ui-check green' : 'ui-close red'}" /></span>
        <span>Platform: <i class="icofont-{contractInfo.platform ? 'ui-check green' : 'ui-close red'}" /></span>
        <span>Name: <i class="icofont-{contractInfo.name ? 'ui-check green' : 'ui-close red'}" /></span>
        <span>Symbol: <i class="icofont-{contractInfo.symbol ? 'ui-check green' : 'ui-close red'}" /></span>
        <span>Decimals: <i class="icofont-{contractInfo.decimals ? 'ui-check green' : 'ui-close red'}" /></span>
        <span>Max Mint: <i class="icofont-{contractInfo.maxMint ? 'ui-check green' : 'ui-close red'}" /></span>
        <span>Logo URI: <i class="icofont-{contractInfo.logoURI ? 'ui-check green' : 'ui-close red'}" /></span>
        <span>Tags: <i class="icofont-{contractInfo.tags ? 'ui-check green' : 'ui-close red'}" /></span>
        <span>Extensions > ABIs:
          {#each contractInfo.extensions.abi as abi}
            <i class="icofont-{abi ? 'ui-check green' : 'ui-close red'}" />
          {/each}
        </span>
        <span>Extensions > Owner Address: <i class="icofont-{contractInfo.extensions.ownerAddress ? 'ui-check green' : 'ui-close red'}" /></span>
        <span>Extensions > Owner Is Multisig: <i class="icofont-{contractInfo.extensions.ownerIsMultisig ? 'ui-check green' : 'ui-close red'}" /></span>
      </div>
    {/each}
    <span>Version: <i class="icofont-{smartContractListStatus.version ? 'ui-check green' : 'ui-close red'}" /></span>
  </section>
  
  <!-- Interaction Lists' Status -->
  <section id="interactionLists">
    {#each interactionsListStatus as interactionsListStatus}
      <h2>{interactionsListStatus.listName} Interactions List Status:</h2>
      <span>Chain ID: <i class="icofont-{interactionsListStatus.chainId ? 'ui-check green' : 'ui-close red'}" /></span>
      <span>Token: <i class="icofont-{interactionsListStatus.token ? 'ui-check green' : 'ui-close red'}" /></span>
      <span>Routes:
        {#each interactionsListStatus.routes as route}
          <i class="icofont-{route ? 'ui-check green' : 'ui-close red'}" />
        {/each}
      </span>
      {#each interactionsListStatus.interactions as interaction, i}
        <div class="subsection">
          <span>Interaction {i + 1}:</span>
          <span>Type: <i class="icofont-{interaction.type ? 'ui-check green' : 'ui-close red'}" /></span>
          <span>Platform: <i class="icofont-{interaction.platform ? 'ui-check green' : 'ui-close red'}" /></span>
          <span>Tokens:
            {#each interaction.tokens as token}
              <i class="icofont-{token ? 'ui-check green' : 'ui-close red'}" />
            {/each}
          </span>
          <span>Contract: <i class="icofont-{interaction.contract ? 'ui-check green' : 'ui-close red'}" /></span>
          <span>Method: <i class="icofont-{interaction.method ? 'ui-check green' : 'ui-close red'}" /></span>
        </div>
      {/each}
      <span>Platforms:
        {#each interactionsListStatus.platforms as platform}
          <i class="icofont-{platform ? 'ui-check green' : 'ui-close red'}" />
        {/each}
      </span>
    {/each}
  </section>

</div>

<!-- #################################################################################################### -->

<style>

  div.wrapper {
    display: flex;
    gap: 1em;
  }

  #smartContractList, #interactionLists {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: .5em;
  }

  div.subsection {
    display: flex;
    flex-direction: column;
    margin-left: 2em;
    font-size: .9em;
  }

  span {
    display: flex;
    align-items: center;
    gap: .5em;
  }

  .green {
    color: green;
  }
  
  .red {
    color: red;
  }

</style>
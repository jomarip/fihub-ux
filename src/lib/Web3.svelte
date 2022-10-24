<script lang="ts">

  // Imports:
  import { Buffer } from 'buffer';
  import { ethers } from 'ethers';
  import { onMount } from 'svelte';
  import { store } from '$lib/stores';
  import { goto } from '$app/navigation';
  import weaver from 'weaverfi';
  import Web3Modal from 'web3modal';
  import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
  // @ts-ignore
  import WalletConnectProvider from '@walletconnect/web3-provider/dist/umd/index.min.js';

  // Type Imports:
  import type { Address } from 'weaverfi/dist/types';

  // Initializations:
  export let cacheProvider: boolean = true;
  const validChainIDs: (`0x${string}` | number)[] = ['0xa86a', 43114];

  // RPCs:
  const avaxRPC = weaver.avax.getInfo().rpcs[0];
  const fallbackAVAX = { chainName: 'Avalanche C-Chain', chainId: '0xa86a', nativeCurrency: { name: 'AVAX', decimals: 18, symbol: 'AVAX' }, rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'] };

  // Web3Modal Options:
  const web3ModalOptions = {
    cacheProvider,
    providerOptions: {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          rpc: {
            '43114': avaxRPC,
          },
        },
      },
      coinbasewallet: {
        package: CoinbaseWalletSDK,
        options: {
          chainId: 43114,
          rpc: avaxRPC,
          appName: 'FiHub',
        },
      },
    },
    theme: {
      background: 'rgba(21,11,63,1)',
      main: 'rgba(246,248,249,1)',
      secondary: 'rgba(71,190,213,1)',
      border: '#413962',
      hover: 'rgba(42,33,80,1)',
    }
  };

  // Function to connect to proper network:
  const connect = async () => {
    if($store.modal) {
      $store.connecting = true;
      try {

        // Provider Connection:
        $store.provider = await $store.modal.connect();
        $store.web3 = new ethers.providers.Web3Provider($store.provider);
        $store.validChain = validChainIDs.includes($store.provider.chainId);

        // Getting Wallet Info:
        await getAddress();
        if($store.validChain) {
          await setWalletTokens();
          await setWalletProjectBalances();
        } else {
          await switchToAvaxNetwork();
        }
  
        // Network Switch Listener:
        $store.web3.on('network', async (newNetwork, oldNetwork) => {
          if(oldNetwork) {
            $store.validChain = $store.provider && validChainIDs.includes($store.provider.chainId);
            if($store.validChain) {
              await setWalletTokens();
              await setWalletProjectBalances();
            } else {
              $store.tokens = [];
            }
          }
        });
  
        // Account Switch Listener:
        window.ethereum.on('accountsChanged', async () => {
          await getAddress();
          await setWalletTokens();
          await setWalletProjectBalances();
        });
  
      } catch {} finally {
        $store.connecting = false;
      }
    }
  }

  // Function to disconnect wallet:
  const disconnect = async () => {

    // Initializations:
    const localKeysToRemove: string[] = [
      'walletconnect',
      'WEB3_CONNECT_CACHED_PROVIDER',
      '-walletlink:https://www.walletlink.org:session:id',
      '-walletlink:https://www.walletlink.org:session:linked',
      '-walletlink:https://www.walletlink.org:session:secret',
      '-walletlink:https://www.walletlink.org:walletUsername',
      '-walletlink:https://www.walletlink.org:Addresses',
      '-walletlink:https://www.walletlink.org:version',
      '-walletlink:https://www.walletlink.org:DefaultJsonRpcUrl',
      '-walletlink:https://www.walletlink.org:IsStandaloneSigning',
      '-walletlink:https://www.walletlink.org:DefaultChainId',
    ];

    // Clearing Local Storage:
    localKeysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    // Clearing Web3 Store:
    $store.address = null;
    $store.provider = undefined;
    $store.tokens = [];
    $store.projectBalances = [];
    $store.web3 = undefined;
    $store.connecting = false;

    goto(`/`);
  }

  // Function to get connected wallet's address:
  const getAddress = async () => {
    if($store.web3) {
      const accounts = await $store.web3.listAccounts();
      if(accounts.length > 0) {
        $store.address = accounts[0] as Address;
      }
    }
  }

  // Function to get connected wallet's token balances:
  const setWalletTokens = async () => {
    if($store.address) {
      $store.tokens = await weaver.avax.getWalletBalance($store.address);
    }
  }

  // Function to get connected wallet's project balances:
  const setWalletProjectBalances = async () => {
    if($store.address) {
      $store.projectBalances = await weaver.avax.getAllProjectBalances($store.address);
    }
  }

  // Function to switch wallet to Avalanche network:
  const switchToAvaxNetwork = async () => {
    if($store.web3 && $store.web3.provider.request) {
      await $store.web3.provider
        .request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0xa86a' }] })
        .then(async () => { $store.validChain = true; })
        .catch(async (err) => {
          if(err.code === 4902 && $store.web3 && $store.web3.provider.request) {
            await $store.web3.provider.request({ method: 'wallet_addEthereumChain', params: [fallbackAVAX] });
          }
        });
    }
  }

  onMount(async () => {
    window.Buffer = Buffer;
    $store.modal = new Web3Modal(web3ModalOptions);
    if($store.modal.cachedProvider) {
      await connect();
    }
  });

</script>

<!-- #################################################################################################### -->

<!-- Slot w/ Web3 Functionality -->
<slot {connect} {disconnect} {switchToAvaxNetwork} />
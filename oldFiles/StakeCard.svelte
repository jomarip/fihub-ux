<script lang="ts">

  // Imports:
  import { store } from '$lib/stores';
  import { erc20ABI } from '$lib/ABIs';
  import { goto } from '$app/navigation';
  import { onMount, onDestroy } from 'svelte';
  import { toast } from '@zerodevx/svelte-toast';
  import ethers from 'ethers';
  import weaver from 'weaverfi';
  import Pill from '$lib/components/Pill.svelte';
  import Button from '$lib/components/Button.svelte';
  import TokenLogo from '$lib/components/TokenLogo.svelte';

  // Type Imports:
  import type { ContractInteraction } from '$lib/types';
  import type { Chain, Hash, TokenData } from 'weaverfi/dist/types';

  // Initializations:
  export let chain: Chain = 'avax';
  export let tokenSymbol: string;
  export let interaction: ContractInteraction;
  let token: TokenData | undefined;
  let txInProgress: boolean = false;
  let approvalTxHash: Hash | undefined;
  let stakeTxHash: Hash | undefined;
  let amount: number = 0;
  let balance: number = 0;
  let allowance: number = 0;
  let checkApprovalInterval: NodeJS.Timer;

  // Toast Success Theme:
  const toastSuccessTheme = { '--toastColor': 'rgb(135, 221, 100)', '--toastBarBackground': 'rgb(135, 221, 100)' };

  // Reactive Tokens:
  $: allTokens = weaver[chain].getTokens();

  // Reactive Token Info:
  $: tokenSymbol, updateTokenInfo();

  // Function to update token info:
  const updateTokenInfo = () => {
    token = allTokens.find(entry => entry.symbol === tokenSymbol);
    balance = $store.tokens.find(entry => entry.symbol === tokenSymbol)?.balance ?? 0;
  }

  // Function to check allowance:
  const checkAllowance = async () => {
    if(token && $store.address) {
      allowance = parseInt(await weaver[chain].query(token.address, erc20ABI, 'allowance', [$store.address, interaction.address])) / (10 ** token.decimals);
    }
  }

  // Function to send approval TX:
  const approve = async () => {
    if(token) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tokenContract = new ethers.Contract(token.address, erc20ABI, signer);
      const amountToApprove = amount * (10 ** token.decimals);
      const tx: ethers.ContractTransaction = await tokenContract.approve(interaction.address, amountToApprove);
      txInProgress = true;
      toast.push(`Approving ${amount.toLocaleString(undefined)} ${token.symbol}`, { duration: 30000 });
      const receipt = await tx.wait();
      toast.pop(0);
      txInProgress = false;
      if(receipt.status) {
        approvalTxHash = receipt.transactionHash as Hash;
        toast.push(`Approval successful`, { theme: toastSuccessTheme });
      } else {
        toast.push(`Approval failed`); // <TODO> add fail theme
      }
    }
  }

  // Function to send stake TX:
  const stake = async () => {
    if(token) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const stakingContract = new ethers.Contract(interaction.address, interaction.abi, signer);
      const amountToStake = amount * (10 ** token.decimals);
      const tx: ethers.ContractTransaction = await stakingContract[interaction.method](amountToStake, ...interaction.args);
      txInProgress = true;
      toast.push(`Staking ${amount.toLocaleString(undefined)} ${token.symbol}`, { duration: 30000 });
      const receipt = await tx.wait();
      toast.pop(0);
      txInProgress = false;
      if(receipt.status) {
        stakeTxHash = receipt.transactionHash as Hash;
        toast.push(`Approval successful`, { theme: toastSuccessTheme });
      } else {
        toast.push(`Approval failed`); // <TODO> add fail theme
      }
    }
  }

  onMount(async () => {
    await checkAllowance();
    checkApprovalInterval = setInterval(checkAllowance, 3000);
  });

  onDestroy(() => {
    clearInterval(checkApprovalInterval);
  });

</script>

<!-- #################################################################################################### -->

<!-- <TODO> cleanup this html/css -->
<div class="flex flex-col rounded-2xl bg-card p-6 text-white">
  {#if !stakingDone}
    <div class="items-top mb-6 flex justify-between gap-2">
      <div class="flex">
        <h3 class="mb-2 font-bold">Lost Worlds -</h3>
        <p class="ml-1 ">Staking</p>
      </div>
      <div class="flex">
        <span class="text-sm">Verified Contract</span>
        <Icon src={CheckCircle} class="ml-1 mt-0.5 h-4 w-4 text-green" />
      </div>
    </div>

    <div class="mb-1 flex w-full justify-end">
      <span class="text-sm font-bold">{maximumAmount} {stakeToken}</span>
    </div>

    <div
      class="mb-3 flex w-full gap-3 rounded-xl border border-dark bg-card py-2 px-3 text-white shadow"
      class:text-red={maximumAmountExceeded}
      class:bg-red-10={maximumAmountExceeded}
    >
      <input
        type="text"
        autocomplete="off"
        autocorrect="off"
        inputmode="decimal"
        maxlength="79"
        minlength="1"
        pattern="^[0-9]*[.,]?[0-9]*$"
        placeholder="0.00"
        step=".01"
        class="w-full bg-transparent focus:outline-0"
        bind:value={stakeAmount}
        on:input={handleStakeAmount}
      />
      <div class="flex gap-2">
        <Button on:click={setMaximumAmount} variant={Variants.Outline} size={Sizes.Small}
          >Max</Button
        >
        <div class="h-6 w-6">
          <TokenLogo name={stakeToken} />
        </div>
        <span class="font-bold">{stakeToken}</span>
      </div>
    </div>
    {#if maximumAmountExceeded}
      <span class="mb-3 text-xs text-red"
        >The amount you want to stake exceeds your the amount you have in your wallet</span
      >
    {/if}
    <div class="mb-3 w-full">
      {#if needsApproval}
        <p class="mb-1">Maximum allowance</p>
        <div
          class="mb-3 flex w-full justify-between gap-3 rounded-xl border border-dark bg-card py-2 px-3 text-white shadow"
        >
          <span>Unlimited</span>

          <Pill type={PillTypes.Warning}>Setting value comes soon</Pill>
        </div>
      {/if}
      {#if transactionInProgress}
        <Button full disabled>Transaction in progress</Button>
      {:else if needsApproval}
        <Button on:click={approveAndStake} full disabled={!stakeAmount}>
          Approve allowance and stake {stakeToken}
        </Button>
      {:else if !needsApproval}
        <Button on:click={stake} full disabled={!stakeAmount}>
          Stake {stakeToken}
        </Button>
      {:else}
        <Button full disabled>Getting allowance data...</Button>
      {/if}
    </div>
  {:else}
    <div class="flex flex-col items-center">
      <div class="my-8">
        <Icon src={CheckCircle} class="h-24 w-24 text-green" />
      </div>
      <h3 class="text-xl text-white">You staked {stakeToken} sucessfully!</h3>
      <a
        href={`https://snowtrace.io/tx/${txHash}`}
        target="_blank"
        class="mb-6 flex h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm text-muted"
      >
        View transaction on Snowtrace <Icon src={ExternalLink} class="h-4 w-4" />
      </a>

      <Button full on:click={() => goto(`/portfolio/${$store.address}`)}
        >Back to your portfolio</Button
      >
    </div>
  {/if}
</div>

<!-- #################################################################################################### -->

<style>

  /* CSS Goes Here */

</style>
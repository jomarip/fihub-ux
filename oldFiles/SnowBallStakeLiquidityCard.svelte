<script lang="ts">
  import { onMount } from 'svelte';
  import { Icon, CheckCircle, ExternalLink } from 'svelte-hero-icons';
  import { Sizes, Variants } from '$lib/enums';
  import { Button, TokenLogo } from '$lib/components';
  import { store } from '$lib/stores';
  import { ethers } from 'ethers';
  import { toast } from '@zerodevx/svelte-toast';
  import pngErc20Abi from 'oldFiles/services/pngerc20';
  import lostWorldsAbi from 'oldFiles/services/lostworldsabi';

  import { goto } from '$app/navigation';

  export let stakeToken: string;

  let depositsDone = false;
  let txHash: string;
  let depositAmount = 0;
  let balance = 0;

  let approvalOne = 'loading'; // loading, needsApproval, finished
  let approvalOneToken = '0x8461681211b49c15e20b3cfd4c63be258878b7d9';
  let approvalOneSpender = '0xf19e161736746ddbe8baed66b87beada8b9476a6';

  let approvalTwo = 'loading';
  let approvalTwoToken = '0xf19e161736746ddbe8baed66b87beada8b9476a6';
  let approvalTwoSpender = '0x2d3f879b3637d8d48ca7617e0f540285e9782342';

  let depositOne = 'loading'; // loading, finished
  let depositOneAddress = '0xF19e161736746DDbE8bAEd66B87beaDa8b9476A6';

  let depositTwo = 'loading';
  let depositTwoAddress = '0x2d3F879B3637d8d48Ca7617e0F540285E9782342';

  onMount(() => {
    setApproval('approvalOne', approvalOneToken, approvalOneSpender);
    setApproval('approvalTwo', approvalTwoToken, approvalTwoSpender);
    setBalance();
  });

  function setBalance() {
    if ($store && $store.tokensMap) {
      balance = checkBalance($store.tokensMap, stakeToken);
    }
  }

  function checkBalance(tokensMap, token) {
    if (tokensMap.hasOwnProperty(token)) {
      return ethers.utils.formatUnits(tokensMap[token].balance, tokensMap[token].decimals);
    } else {
      return 0;
    }
  }

  async function setApproval(approvalVar, tokenContract, spenderContract) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const pngContract = new ethers.Contract(tokenContract, pngErc20Abi, signer);

    let allowance = await pngContract.allowance($store.address, spenderContract);
    allowance = ethers.utils.formatEther(allowance.toString());

    let allowanceStatus = allowance == 0.0 ? 'needsApproval' : 'approved';

    if (approvalVar === 'approvalOne') {
      approvalOne = allowanceStatus;
    } else if (approvalVar === 'approvalTwo') {
      approvalTwo = allowanceStatus;
    }
  }

  async function approveAndDeposit() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    let pngContract = new ethers.Contract(approvalOneToken, pngErc20Abi, signer);
    let approvalAllowanceValue = ethers.BigNumber.from(
      ethers.utils.parseEther(depositAmount.toString()),
    );
    const tx = await pngContract.approve(approvalOneSpender, approvalAllowanceValue);

    if (tx.hash) {
      txHash = tx.hash;
      toast.push('Approval 1/2 pending', { duration: 30000 });
      approvalOne = 'pending';

      provider.once(tx.hash, (transaction) => {
        if (transaction.blockNumber) {
          approvalOne = 'approved';
          approveTwo();

          toast.pop(0);
          toast.push('Approval 1/2 successful', {
            theme: {
              '--toastColor': 'rgb(135, 221, 100)',
              '--toastBarBackground': 'rgb(135, 221, 100)',
            },
          });
        }
      });
    }
  }

  async function approveTwo() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    let pngContract = new ethers.Contract(approvalTwoToken, pngErc20Abi, signer);
    let approvalAllowanceValue = ethers.constants.MaxUint256;
    const tx = await pngContract.approve(approvalTwoSpender, approvalAllowanceValue);

    if (tx.hash) {
      txHash = tx.hash;
      toast.push('Approval 2/2 pending', { duration: 30000 });
      approvalTwo = 'pending';

      provider.once(tx.hash, (transaction) => {
        if (transaction.blockNumber) {
          approvalTwo = 'approved';

          depositTxOne();
          toast.pop(0);
          toast.push('Approval 2/2 successful', {
            theme: {
              '--toastColor': 'rgb(135, 221, 100)',
              '--toastBarBackground': 'rgb(135, 221, 100)',
            },
          });
        }
      });
    }
  }

  async function depositTxOne() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const proxy = new ethers.Contract(depositOneAddress, lostWorldsAbi, signer);
    let depositValue = ethers.utils.parseEther(depositAmount.toString());
    const tx = await proxy.deposit(depositValue);
    if (tx.hash) {
      txHash = tx.hash;
      toast.push('Deposit 1/2 pending', { duration: 30000 });
      depositOne = 'pending';

      provider.once(tx.hash, (transaction) => {
        if (transaction.blockNumber) {
          depositOne = 'finished';
          depositTxTwo();
          toast.pop(0);
          toast.push('Deposit 1/2 successful', {
            theme: {
              '--toastColor': 'rgb(135, 221, 100)',
              '--toastBarBackground': 'rgb(135, 221, 100)',
            },
          });
        }
      });
    }
  }

  async function depositTxTwo() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const abi = [
      {
        type: 'function',
        stateMutability: 'nonpayable',
        outputs: [],
        name: 'depositAll',
        inputs: [],
      },
    ];
    const proxy = new ethers.Contract(depositTwoAddress, abi, signer);
    const tx = await proxy.depositAll();
    if (tx.hash) {
      txHash = tx.hash;
      toast.push('Deposit 2/2 pending', { duration: 30000 });
      depositTwo = 'pending';

      provider.once(tx.hash, (transaction) => {
        if (transaction.blockNumber) {
          depositTwo = 'finished';
          depositsDone = true;
          toast.pop(0);
          toast.push('Deposit 2/2 successful', {
            theme: {
              '--toastColor': 'rgb(135, 221, 100)',
              '--toastBarBackground': 'rgb(135, 221, 100)',
            },
          });
        }
      });
    }
  }

  function setMaximumAmount() {
    depositAmount = ethers.utils.formatUnits(
      $store.tokensMap[stakeToken].balance,
      $store.tokensMap[stakeToken].decimals,
    );
  }

  function sanitize(e) {
    e.preventDefault();
    const value = e.target.value.replace(/,/g, '.').replace(/[^\d^\.]/g, '');

    depositAmount = value;
  }
</script>

<div class="flex flex-col rounded-2xl bg-card p-6 text-white">
  {#if !depositsDone}
    <div class="items-top mb-6 flex justify-between gap-2">
      <div class="flex">
        <h3 class="mb-2 font-bold">Avax - Lost</h3>
        <p class="ml-1 ">Auto compound</p>
      </div>
      <div class="flex">
        <span class="text-sm">Verified Contract </span>
        <Icon src={CheckCircle} class="ml-1 mt-0.5 h-4 w-4 text-green" />
      </div>
    </div>

    <div class="mb-1 flex w-full justify-end">
      <span class="text-sm font-bold">{balance} {stakeToken}</span>
    </div>
    <div
      class="mb-6 flex w-full gap-3 rounded-xl border border-dark bg-card py-2 px-3 text-white shadow"
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
        class="w-full bg-card focus:outline-0"
        bind:value={depositAmount}
        on:input={sanitize}
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

    <div class="mb-6 flex justify-between">
      <div class="flex flex-col items-center gap-1">
        <div
          class="h-5 w-5 rounded-full"
          class:bg-grey-10={(approvalOne === 'loading' || approvalOne === 'needsApproval') &&
            approvalTwo !== 'approved'}
          class:bg-orange={approvalOne === 'pending'}
          class:bg-green={approvalOne === 'approved' || approvalTwo === 'approved'}
        />
        <span>Approval 1/2</span>
      </div>
      <div class="flex flex-col items-center gap-1">
        <div
          class="h-5 w-5 rounded-full bg-grey-10"
          class:bg-grey-10={approvalTwo === 'loading' || approvalTwo === 'needsApproval'}
          class:bg-orange={approvalTwo === 'pending'}
          class:bg-green={approvalTwo === 'approved'}
        />
        <span>Approval 2/2</span>
      </div>
      <div class="flex flex-col items-center gap-1">
        <div
          class="h-5 w-5 rounded-full bg-grey-10"
          class:bg-grey-10={depositOne === 'loading'}
          class:bg-orange={depositOne === 'pending'}
          class:bg-green={depositOne === 'finished'}
        />
        <span>Deposit 1/2</span>
      </div>
      <div class="flex flex-col items-center gap-1">
        <div
          class="h-5 w-5 rounded-full bg-grey-10"
          class:bg-grey-10={depositTwo === 'loading'}
          class:bg-orange={depositTwo === 'pending'}
          class:bg-green={depositTwo === 'finished'}
        />
        <span>Deposit 2/2</span>
      </div>
    </div>

    <Button full on:click={approveAndDeposit} disabled={!depositAmount}>Approve and deposit</Button>
  {:else}
    <div class="flex flex-col items-center">
      <div class="my-8">
        <Icon src={CheckCircle} class="h-24 w-24 text-green" />
      </div>
      <h3 class="text-xl text-white">You auto compounded AVAX/LOST LP on Snowball sucessfully!</h3>
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

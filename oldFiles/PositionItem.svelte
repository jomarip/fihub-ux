<script lang="ts">
  import { Icon, ArrowRight, ChevronDown } from 'svelte-hero-icons';

  import { Link, TokenLogo } from '$lib/components';

  import { Sizes } from '$lib/enums';

  let positions = [
    {
      left: 'LOST',
      right: 'AVAX',
      apy: '9.06%',
      balance: { amount: 5008.98, dollarAmount: '$76.00' },
      rewards: { amount: 39.33, dollarAmount: '$6.03' },
    },
    {
      left: 'USDC.e',
      right: 'AVAX',
      apy: '9.06%',
      balance: { amount: 5008.98, dollarAmount: '$76.00' },
      rewards: { amount: 39.33, dollarAmount: '$6.03' },
    },
  ];
</script>

<div class="mb-6 rounded-2xl bg-hover text-white">
  <div class="flex flex-col p-4 lg:p-8">
    <div class="flex items-center justify-between gap-2.5">
      <div class="flex gap-2.5">
        <div class="h-8 w-8">
          <TokenLogo name="PNG" />
        </div>
        <span class="text-2xl font-bold">{'PANGOLIN'}</span>
      </div>
      <div class="flex gap-2.5">
        <span class="text-xl font-semibold"> $1867.23 </span>
      </div>
    </div>
    <div>
      <div class="my-6 h-px bg-dark" />
      <div class="mb-6">
        <div class="inline-block rounded-r-lg bg-dark p-2 text-white">Providing Liquidity</div>
      </div>
      <div class="flex flex-col gap-6">
        {#each positions as { left, right, apy, balance, rewards }}
          <div class="flex items-center justify-between rounded-xl bg-card p-4 lg:p-6">
            <div class="flex items-center gap-2.5 sm:w-1/4">
              <div class="flex">
                <div class="h-4 w-4 lg:h-8 lg:w-8">
                  <TokenLogo name={left} />
                </div>
                <div class="-ml-0.5 h-4 w-4 lg:-ml-1 lg:h-8 lg:w-8">
                  <TokenLogo name={right} />
                </div>
              </div>
              <span class="font-bold">{left} - {right}</span>
            </div>
            <div class="hidden sm:flex sm:flex-col sm:items-center">
              <span class="text-sm">APY</span>
              <span class="font-bold">{apy}</span>
            </div>
            <div class="flex flex-col items-center">
              <span class="text-sm">Balance</span>
              <span class="font-bold"
                >{balance.amount}<span class="ml-1 text-sm font-normal"
                  >({balance.dollarAmount})</span
                ></span
              >
            </div>
            <div class="hidden sm:flex-col lg:flex lg:items-center">
              <span class="text-sm">Rewards</span>
              <span class="font-bold"
                >{rewards.amount}<span class="ml-1 text-sm font-normal"
                  >({rewards.dollarAmount})</span
                ></span
              >
            </div>
            <div class="hidden md:flex md:flex-col md:items-center">
              <Link full to="/track/lost-123" size={Sizes.Small} icon={ArrowRight} iconRight>
                Track</Link
              >
            </div>
            <div class="flex items-center md:hidden">
              <Icon src={ChevronDown} class="h-6 w-6" />
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

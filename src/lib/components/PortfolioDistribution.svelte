<script lang="ts">

  // Type Imports:
  import type { NativeToken, Token } from 'weaverfi/dist/types';

  // Initializations:
  export let tokens: (NativeToken | Token)[];
  const hiddenPercentage: number = 10;

  // Reactive Net Worth:
  $: netWorth = getNetWorth(tokens);

  // Reactive Distribution:
  $: distribution = getDistribution(tokens);
  $: walletDist = (distribution.none / netWorth) * 100;
  $: stakingDist = (distribution.staked / netWorth) * 100;
  $: lpDist = (distribution.liquidity / netWorth) * 100;
  $: lendingDist = (distribution.lent / netWorth) * 100;
  $: rewardsDist = (distribution.unclaimed / netWorth) * 100;

  // Function to get net worth:
  const getNetWorth = (tokens: (NativeToken | Token)[]) => {
    const tokenValues = tokens.map(token => token.status !== 'borrowed' ? token.balance * token.price : 0);
    const sum = tokenValues.reduce((a, b) => a + b, 0);
    return sum;
  }

  // Function to get portfolio distribution:
  const getDistribution = (tokens: (NativeToken | Token)[]) => {
    const newDistribution = { borrowed: 0, lent: 0, liquidity: 0, none: 0, staked: 0, unclaimed: 0 };
    tokens.forEach(token => {
      newDistribution[token.status] += (token.balance * token.price);
    });
    return newDistribution;
  }

</script>

<!-- #################################################################################################### -->

<div class="wrapper">

  <!-- Net Worth -->
  <div class="netWorth">
    <span>Net Worth</span>
    <p>${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
  </div>

  <!-- TODO - this can be refactored to show all labels in order below, disconnected from each individual section -->
  <!-- Distribution -->
  <div class="distribution" class:hide={distribution.none === 0}>
    <div class="wallet category" title="Wallet" style="flex: {walletDist}">
      <span class="circle" class:hide={walletDist < hiddenPercentage} />
      <span class="type" class:hide={walletDist < hiddenPercentage}>Wallet</span>
    </div>
    <div class="staking category" title="Staking" style="flex: {stakingDist}">
      <span class="circle" class:hide={stakingDist < hiddenPercentage} />
      <span class="type" class:hide={stakingDist < hiddenPercentage}>Staking</span>
    </div>
    <div class="lp category" title="LP" style="flex: {lpDist}">
      <span class="circle" class:hide={lpDist < hiddenPercentage} />
      <span class="type" class:hide={lpDist < hiddenPercentage}>LP</span>
    </div>
    <div class="lending category" title="Lending" style="flex: {lendingDist}">
      <span class="circle" class:hide={lendingDist < hiddenPercentage} />
      <span class="type" class:hide={lendingDist < hiddenPercentage}>Lending</span>
    </div>
    <div class="rewards category" title="Rewards" style="flex: {rewardsDist}">
      <span class="circle" class:hide={rewardsDist < hiddenPercentage} />
      <span class="type" class:hide={rewardsDist < hiddenPercentage}>Rewards</span>
    </div>
  </div>
</div>

<!-- #################################################################################################### -->

<style>

  div.wrapper {
    width: 100%;
    background: var(--darkGreyBlue);
    border-radius: 1em;
    overflow: hidden;
  }

  div.netWorth {
    padding: 1.5em;
  }

  div.netWorth > p {
    font-size: 1.5em;
    font-weight: bold;
  }

  div.distribution {
    position: relative;
    display: flex;
    padding: 1em;
    background: var(--greyBlue);
  }

  div.category {
    display: flex;
    align-items: center;
    gap: .3em;
    border-top: 3px solid;
    overflow: hidden;
  }

  span.circle {
    flex-shrink: 0;
    display: inline-block;
    height: .5em;
    width: .5em;
    margin: .8em 0 0 .5em;
    border-radius: 50%;
  }

  span.type {
    margin: .8em .5em 0 0;
  }

  div.wallet {
    border-color: var(--orange);
  }

  div.wallet > span.circle {
    background-color: var(--orange);
  }

  div.staking {
    border-color: var(--lightGreen);
  }

  div.staking > span.circle {
    background-color: var(--lightGreen);
  }

  div.lp {
    border-color: var(--red);
  }

  div.lp > span.circle {
    background-color: var(--red);
  }

  div.lending {
    border-color: var(--lightBlue);
  }

  div.lending > span.circle {
    background-color: var(--lightBlue);
  }

  div.rewards {
    border-color: purple;
  }

  div.rewards > span.circle {
    background-color: purple;
  }

  @media screen and (min-width: 600px) {
    div.netWorth {
      padding: 2em;
    }
  }

</style>
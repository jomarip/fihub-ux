<script lang="ts">

  // Imports:
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { store } from '$lib/stores';
  import { goto } from '$app/navigation';
  import { scrollToTop } from '$lib/helpers';
  import { getInteractionsList, getAllContractInfo, trackGPS } from '$lib/tracks';
  import Button from '$lib/components/Button.svelte';
  import LPCard from '$lib/components/actions/LPCard.svelte';
  import TrackOption from '$lib/components/TrackOption.svelte';
  import FarmCard from '$lib/components/actions/FarmCard.svelte';
  import LendCard from '$lib/components/actions/LendCard.svelte';
  import MintCard from '$lib/components/actions/MintCard.svelte';
  import StakeCard from '$lib/components/actions/StakeCard.svelte';
  import TrackTokenInfo from '$lib/components/TrackTokenInfo.svelte';
  import PlatformOption from '$lib/components/PlatformOption.svelte';
  import TrackPlatformInfo from '$lib/components/TrackPlatformInfo.svelte';
  import AutocompoundCard from '$lib/components/actions/AutocompoundCard.svelte';
  import PortfolioDistribution from '$lib/components/PortfolioDistribution.svelte';

  // Type Imports:
  import type { Address } from 'weaverfi/dist/types';
  import type { InteractionsList, InteractionsListPlatform, SmartContractInfo, TrackGPS } from '$lib/types';

  // Initializations:
  let list: InteractionsList;
  let contractInfo: Record<Address, SmartContractInfo>;
  let trackTaken: string[] = [];

  // Reactive Track:
  $: token = $page.params.token;
  $: platform = list && list.token.platform ? list.platforms.find(platform => platform.name === list.token.platform) : undefined;
  $: trackStatus = trackGPS(trackTaken, list);
  $: trackOptions = getTrackOptions(trackStatus);
  $: platformOptions = getPlatformOptions(trackStatus);
  $: prettyTrackTaken = prettifyTrackTaken(trackTaken);
  $: currentStop = trackTaken.length > 0 ? trackTaken[trackTaken.length - 1] : '';
  $: trackTaken, scrollToTop();

  // Function to find track options:
  const getTrackOptions = (gps: TrackGPS | undefined) => {
    if(gps) {
      const routes = Object.keys(gps.possibleRoutes);
      const tracks = routes.map(route => gps.possibleRoutes[route][0].type);
      return tracks;
    }
    return [];
  }

  // Function to find platform options:
  const getPlatformOptions = (gps: TrackGPS | undefined) => {
    if(gps) {
      const routes = Object.keys(gps.possibleRoutes);
      const platformNames = routes.map(route => gps.possibleRoutes[route][0].platform);
      const platforms = platformNames.map(name => list.platforms.find(entry => entry.name === name));
      const filteredPlatforms = platforms.filter(entry => entry !== undefined) as InteractionsListPlatform[];
      return filteredPlatforms;
    }
    return [];
  }

  // Function to prettify track taken for on-page display:
  const prettifyTrackTaken = (rawTrackArray: string[]) => {
    const prettyTrack: string[] = [];
    rawTrackArray.forEach(entry => {
      let prettyEntry = entry.slice().charAt(0).toUpperCase() + entry.slice().slice(1);
      if(entry === 'lp') {
        prettyEntry = 'LP';
      } else if(entry === 'autocompound') {
        prettyEntry = 'Auto-Compound';
      }
      prettyTrack.push(prettyEntry);
    });
    return prettyTrack;
  }

  // Function to continue track progress after a given action:
  const continueTrack = () => {
    if(trackOptions.length > 0) {
      trackTaken = [...trackTaken, 'options'];
    } else {
      goto(`/portfolio/${$store.address}`);
    }
  }

  onMount(async () => {
    list = await getInteractionsList(token);
    contractInfo = await getAllContractInfo(list);
  });

</script>

<!-- #################################################################################################### -->

<!-- SvelteKit Dynamic Header -->
<svelte:head>
  <title>FiHub | {token} Track</title>
  <meta name="description" content="The hub for all things DeFi. Check out everything you can do with the {token} token!" />
</svelte:head>

<!-- Portfolio Distribution -->
<PortfolioDistribution tokens={$store.tokens} />

<!-- Back To Portfolio Button -->
<div class="portfolioButton">
  <Button outline icon="arrow-left" on:click={() => goto(`/portfolio/${$store.address}`)}>Back</Button>
</div>

<!-- Track Route -->
<div class="trackRoute">
  <a href="/portfolio/{$store.address}">Portfolio</a>
  <span>&nbsp;/&nbsp;</span>
  <span class="clickable" on:click={() => trackTaken = []}>{token}</span>
  {#each prettyTrackTaken as track, i}
    {#if track !== 'Options' || i === prettyTrackTaken.length - 1}
      <span>&nbsp;/&nbsp;</span>
      <span class="clickable" on:click={() => trackTaken = trackTaken.slice(0, i + 1)}>{track}</span>
    {/if}
  {/each}
</div>

<!-- Track Content -->
{#if list && contractInfo}
  <div class="trackContent">

    <!-- Basic Track Info -->
    {#if currentStop === ''}
      {#if platform}
        <TrackPlatformInfo {platform} />
      {/if}
      <TrackTokenInfo token={list.token} />
      <Button color="var(--lightGreen)" icon="arrow-right" iconRight on:click={() => trackTaken = ['options']}>See what you can do with {list.token.symbol}</Button>

    <!-- Track Options -->
    {:else if currentStop === 'options'}
      {#each trackOptions as option}
        <TrackOption {option} {token} onSelect={() => trackTaken = [...trackTaken, option]} />
      {/each}
      
    <!-- Platform Options -->
    {:else if currentStop === 'stake' || currentStop === 'lp' || currentStop === 'farm' || currentStop === 'autocompound'}
      {#each platformOptions as option}
        <PlatformOption {option} track={currentStop} onSelect={() => trackTaken = [...trackTaken, option.name]} />
      {/each}
      <!-- TODO - add resources regarding track type -->

    <!-- Track Actions -->
    {:else if trackTaken.length > 1}
      
      <!-- Stake -->
      {#if trackTaken[trackTaken.length - 2] === 'stake' }
        <StakeCard {list} {contractInfo} location={trackStatus.location} onContinue={continueTrack} />

      <!-- LP -->
      {:else if trackTaken[trackTaken.length - 2] === 'lp' }
        <LPCard {list} {contractInfo} location={trackStatus.location} onContinue={continueTrack} />
      
      <!-- Farm -->
      {:else if trackTaken[trackTaken.length - 2] === 'farm' }
        <FarmCard {list} {contractInfo} location={trackStatus.location} onContinue={continueTrack} />
      
      <!-- Auto-Compound -->
      {:else if trackTaken[trackTaken.length - 2] === 'autocompound' }
        <AutocompoundCard {list} {contractInfo} location={trackStatus.location} onContinue={continueTrack} />

      <!-- Lend -->
      {:else if trackTaken[trackTaken.length - 2] === 'lend' }
        <LendCard {list} {contractInfo} location={trackStatus.location} onContinue={continueTrack} />

      <!-- Mint -->
      {:else if trackTaken[trackTaken.length - 2] === 'mint' }
        <MintCard {list} {contractInfo} location={trackStatus.location} onContinue={continueTrack} />
      {/if}
      
    {/if}

    <!-- TODO - add track tree diagram -->
      
  </div>
{/if}

<!-- #################################################################################################### -->

<style>

  a {
    color: inherit;
    text-decoration: none;
  }

  div.portfolioButton {
    margin: 1.2em 0 2em;
    font-size: .9em;
  }

  div.trackRoute {
    margin-bottom: 1em;
    padding-bottom: .2em;
    border-bottom: 1px solid white;
  }

  div.trackRoute > a {
    color: inherit;
    text-decoration: none;
  }

  div.trackRoute > span:last-of-type {
    font-weight: bold;
  }

  div.trackContent {
    display: flex;
    flex-direction: column;
    gap: 1.5em;
  }

</style>
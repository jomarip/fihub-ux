<script>
  import { ArrowLeft } from 'svelte-hero-icons';
  import { Sizes, Variants } from '$lib/enums';

  import { ActionCard, BreadCrumbs, Container, Section } from '$lib/components';
  import { getStationsAndTracks } from '$lib/flow/lost';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import Svelvet from '$lib/Svelvet';

  let { stations, tracks } = getStationsAndTracks($page.routeId);
</script>

<Container>
  <div class="mx-auto max-w-2xl">
    <BreadCrumbs />
    <Section size={Sizes.Small}>
      <div class="flex flex-col gap-6">
        <ActionCard
          tokenLogo="LOST"
          youtubeEmbedID="7zpJTvyzdrM"
          actionFunc={() => goto('/track/LOST/options/staking/lostworlds')}
          callToActionText="Stake LOST on Lost Worlds"
          title="Stake on Lost Worlds"
          apr="270.19"
        >
          <div slot="description">
            <p class="mb-3">
              By staking LOST, you will earn more LOST over time, claimable at any time. Depending
              on the amount staked, you will also earn some tiered benefits:
            </p>
            <ul class="mb-3 list-disc pl-4 text-white">
              <li class="mb-2.5">
                <span class="font-bold">Bronze Tier (no minimum stake):</span> Bronze Projects & Achievements,
                Events, Platform Achievements, Secondary Marketplace.
              </li>
              <li class="mb-2.5">
                <span class="font-bold">Silver Tier (100+ LOST):</span> Bronze Perks, Silver Projects
                & Achievements, Minter Rewards, Minter Royalties, Mint Dividends.
              </li>
              <li class="mb-2.5">
                <span class="font-bold">Gold Tier (1000+ LOST):</span> Silver Perks, Gold Projects &
                Achievements, Location Generative Projects.
              </li>
            </ul>
          </div>
        </ActionCard>
      </div></Section
    >
    <Section size={Sizes.Small} title="Available tracks" center>
      <div
        style="max-width: 340px"
        class="mx-auto flex flex-col items-center border-2 border-white bg-card shadow-sm shadow-white"
      >
        <Svelvet width="330" height="480" nodes={stations} edges={tracks} />
      </div>
    </Section>
  </div>
</Container>

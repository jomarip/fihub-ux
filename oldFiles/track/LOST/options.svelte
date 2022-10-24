<script lang="ts">
  import { ArrowLeft } from 'svelte-hero-icons';
  import { Sizes, Variants } from '$lib/enums';

  import { ActionCard, BreadCrumbs, Container, Section } from '$lib/components';
  import { getStationsAndTracks } from '$lib/flow/lost';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import Svelvet from '$lib/Svelvet';

  const { stations, tracks } = getStationsAndTracks($page.routeId);
</script>

<Container>
  <div class="mx-auto max-w-2xl">
    <BreadCrumbs />
    <Section size={Sizes.Small}>
      <div class="flex flex-col gap-6">
        <ActionCard
          actionFunc={() => goto('/track/LOST/options/staking')}
          youtubeEmbedID="oqtJ8E0bVyI"
          callToActionText="Stake LOST"
          title="What is Staking?"
          apr="250-280"
        >
          <p slot="description">
            Staking refers to depositing or locking a token for some financial incentive. This is
            generally a very safe endeavour, where the only usual risk exposure is the price action
            of the token you are staking. Different platforms can adopt many different methods of
            rewarding stakers, either through token emissions, revenue sharing or any number of
            other methodologies.
          </p>
        </ActionCard>
        <ActionCard
          actionFunc={() => goto('/track/LOST/options/liquidity')}
          youtubeEmbedID="CpdYhgCvzss"
          callToActionText="Provide LOST Liquidity"
          title="What are liquidity pools?"
          apr="65.3 - 254"
        >
          <p slot="description">
            Liquidity pools are how decentralised exchanges find the liquidity to offer traders a
            way to swap between any two tokens. When you provide liquidity to a liquidity pool, you
            are depositing at least two different tokens in the pool and given an LP token as a
            receipt. When deposited, you are exposed to the price action of each token, as well as
            impermanent loss. At the same time, you are earning a portion of swap fees accrued
            through traders swapping tokens with the liquidity you've provided. Decentralised
            exchanges might also offer extra incentives in order to attract liquidity.
          </p>
        </ActionCard>
      </div>
    </Section>
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

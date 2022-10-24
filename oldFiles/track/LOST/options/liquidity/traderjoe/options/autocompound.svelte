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
        <div class="flex flex-col gap-6">
          <ActionCard
            soon
            tokenLogo="SNOB"
            youtubeEmbedID="jc3JpNI7paY"
            actionFunc={() =>
              goto('/track/LOST/options/liquidity/traderjoe/options/autocompound/snowball')}
            callToActionText="Auto-compound on Snowball"
            title="What is Snowball?"
          >
            <p slot="description">
              Snowball is a venture studio and the longest-running DAO on Avalanche. Their series of
              products includes Snowball Earn, Axial, Teddy, Lava and FiHub itself!
            </p>
          </ActionCard>
          <ActionCard
            soon
            tokenLogo="YY"
            actionFunc={() =>
              goto('/track/LOST/options/liquidity/traderjoe/options/autocompound/yieldyak')}
            callToActionText="Auto-compound on YieldYak"
            title="What is YieldYak?"
          >
            <p slot="description">
              YieldYak is an auto-compounding platform native to Avalanche, also offering their own
              swap aggregator, staking as well as boosted Trader Joe and Platypus farms.
            </p>
          </ActionCard>
        </div>
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

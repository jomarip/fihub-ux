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
          tokenLogo="PNG"
          youtubeEmbedID="-c7G0dlthac"
          actionFunc={() => goto('/track/LOST/options/liquidity/pangolin')}
          callToActionText="Provide liquidity on Pangolin"
          title="What is Pangolin?"
        >
          <p slot="description">
            Pangolin is a community-driven decentralised exchange, up and running since the
            beginning of Avalanche. They also offer limit orders as well as staking.
          </p>
        </ActionCard>
        <ActionCard
          soon
          tokenLogo="JOE"
          youtubeEmbedID="uuAUTgWhcjI"
          actionFunc={() => goto('/track/LOST/options/liquidity/traderjoe/options')}
          callToActionText="Provide liquidity on Trader Joe"
          title="What is Trader Joe?"
        >
          <p slot="description">
            Trader Joe is the largest decentralised exchange on Avalanche, also offering a series of
            other products such as their launchpad, lending market and staking facilities.
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

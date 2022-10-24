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
          soon
          youtubeEmbedID="lBh9TOpFspM"
          actionFunc={() => goto('/track/LOST/options/liquidity/traderjoe/options/autocompound')}
          callToActionText="Auto-compound"
          title="What is auto-compounding?"
        >
          <p slot="description">
            Auto-compounding refers to automatically reinvesting incentives earned into your
            original stake, lending balance and/or provided liquidity. By automating this process,
            it is no longer time-intensive or expensive due to gas fees to achieve a higher yield on
            your investments. The only added risk is additional smart contract risk due to
            interacting with at least one more contract than your original investment.
          </p></ActionCard
        >
        <ActionCard
          soon
          actionFunc={() => goto('/track/LOST/options/liquidity/traderjoe/options/farm')}
          callToActionText="Farm"
          title="What is yield farming?"
        >
          <p slot="description">
            Yield farming means to search for incentives for your provided liquidity. By depositing
            your LP tokens acquired from depositing liquidity into a given platform, you are
            accruing minimal extra risk, while gaining some token incentives from whatever platform
            you have deposited in, other than what you are already gaining from having provided
            liquidity in the form of fees.
          </p></ActionCard
        >
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

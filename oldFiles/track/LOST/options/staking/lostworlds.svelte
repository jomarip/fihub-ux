<script>
  import { ArrowLeft } from 'svelte-hero-icons';
  import { Sizes, Variants } from '$lib/enums';

  import { StakeCard, BreadCrumbs, Container, Section } from '$lib/components';
  import { getStationsAndTracks } from '$lib/flow/lost';
  import { page } from '$app/stores';
  import Svelvet from '$lib/Svelvet';

  let { stations, tracks } = getStationsAndTracks($page.routeId);
</script>

<Container>
  <div class="mx-auto max-w-2xl">
    <BreadCrumbs />
    <Section size={Sizes.Small}>
      <div class="flex flex-col gap-6">
        <StakeCard stakeToken="LOST" />
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

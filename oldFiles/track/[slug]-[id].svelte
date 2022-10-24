<script>
  import { ArrowLeft } from 'svelte-hero-icons';
  import { Sizes, Variants } from '$lib/enums';

  import ActionCard from '$lib/components/ActionCard.svelte';
  import Button from '$lib/components/Button.svelte';
  import Container from '$lib/components/Container.svelte';
  import Section from '$lib/components/Section.svelte';
  import PortfolioDistribution from '$lib/components/PortfolioDistribution.svelte';
  import ProvidingLiquidityCard from '$lib/components/ProvidingLiquidityCard.svelte';
  import ResourceCard from '$lib/components/ResourceCard.svelte';
  import SelectVendorCard from '$lib/components/SelectVendorCard.svelte';
  import VideoCard from '$lib/components/VideoCard.svelte';
</script>

<Container>
  <div class="mx-auto max-w-2xl">
    <div class="mb-5">
      <PortfolioDistribution />
    </div>
    <div class="mb-6">
      <Button variant={Variants.Outline} size={Sizes.Small} icon={ArrowLeft}>Back</Button>
    </div>
    <Section size={Sizes.Small} title="My Assets / Lost">
      <div class="flex flex-col gap-6">
        <SelectVendorCard />
      </div>
    </Section>
    <Section size={Sizes.Small} title="About this stratgy" tooltip="This is a tooltip" center>
      <div class="flex flex-col gap-6">
        <ResourceCard />
        <VideoCard />
        <ActionCard />
        <ProvidingLiquidityCard from="AVAX" to="LOST" />
      </div>
    </Section>
  </div>
</Container>

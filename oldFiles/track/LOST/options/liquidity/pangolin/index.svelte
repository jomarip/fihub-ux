<script>
  import { Sizes } from '$lib/enums';

  import { BreadCrumbs, Container, ProvidingLiquidityCard, Section } from '$lib/components';
</script>

<Container>
  <div class="mx-auto max-w-2xl">
    <BreadCrumbs />
    <Section size={Sizes.Small}>
      <div class="flex flex-col gap-6">
        <ProvidingLiquidityCard tokenA="AVAX" tokenB="LOST" />
      </div>
    </Section>
  </div>
</Container>

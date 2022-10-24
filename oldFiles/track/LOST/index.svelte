<script lang="ts">
  import { page } from '$app/stores';
  import { store } from '$lib/Web3.svelte';
  import { ArrowLeft, ArrowRight } from 'svelte-hero-icons';
  import { Colors, Sizes, Variants } from '$lib/enums';
  import { Button, Container, Section, SwapCard, YouTubeEmbed, BreadCrumbs } from '$lib/components';
  import { getStationsAndTracks } from '$lib/flow/lost';
  import Svelvet from '$lib/Svelvet';
  import { goto } from '$app/navigation';
  import { browser } from '$app/env';
  import { onDestroy } from 'svelte';
  import { ethers } from 'ethers';

  let haveEnoughLost: boolean;

  const checkLostBalance = () => {
    const token = $store.tokensMap['LOST'];
    if (!token) return;

    haveEnoughLost = Number(ethers.utils.formatUnits(token.balance, token.decimals)) >= 1;
  };

  if (browser) {
    checkLostBalance();

    const interval = setInterval(checkLostBalance, 1000);
    onDestroy(() => clearInterval(interval));
  }
  const { stations, tracks } = getStationsAndTracks($page.routeId);
</script>

<Container>
  <div class="mx-auto max-w-2xl">
    <BreadCrumbs />
    <Section size={Sizes.Small}>
      <div class="flex flex-col gap-6">
        <article class="rounded-2xl bg-card p-4 text-white lg:p-6">
          <div class="mb-2 flex items-center justify-between">
            <h3 class="text-xl font-semibold">What is the LOST token?</h3>
          </div>

          <p class="mb-3 text-sm">
            The LOST token is Lost World's governance token, as well as the token distributed as
            rewards for users of the protocol. The ERC-20 token has a maximum supply of 50M tokens,
            had a private sale of 9.5% of its supply and a public sale of 4% of its supply. 35% of
            its supply is allocated for reward distributions.
          </p>
          <div class="mb-4">
            <YouTubeEmbed id={'08L00IjFz9c'} />
          </div>

          {#if haveEnoughLost}
            <Button
              full
              on:click={() => goto('/track/LOST/options')}
              icon={ArrowRight}
              color={Colors.Green}
              iconRight>Start LOST Track</Button
            >
          {:else}
            <Section size={Sizes.Small} title="Swap AVAX to LOST">
              <p class="mb-3 text-sm">
                You don't have enough LOST tokens, please swap some AVAX to lost before we start the
                track
              </p>
              <SwapCard from="AVAX" to="LOST" />
            </Section>
          {/if}
        </article>
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

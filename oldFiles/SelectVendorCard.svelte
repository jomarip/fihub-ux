<script lang="ts">
  import { Icon, QuestionMarkCircle } from 'svelte-hero-icons';
  import { Tooltip } from 'svelte-tooltip-simple';

  import { Button, TokenLogo } from '$lib/components';
</script>

<article class="rounded-2xl bg-card p-4 text-white lg:p-6">
  <div class="mb-3 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <TokenLogo name="PNG" />
      <span>Pangolin</span>
    </div>
    <div class="flex flex-col items-end">
      <div class="flex items-center gap-2">
        <span class="font-bold">APY</span>
        <Tooltip>
          <div class="h-4 w-4">
            <Icon src={QuestionMarkCircle} class="cursor-pointer text-white" />
          </div>
          <svelte:fragment slot="content">
            <div class="max-w-xs">
              The annual percentage yield (APY) is the real rate of return earned on an investment,
              taking into account the effect of compounding interest. Unlike simple interest,
              compounding interest is calculated periodically and the amount is immediately added to
              the balance. With each period going forward, the account balance gets a little bigger,
              so the interest paid on the balance gets bigger as well.
            </div>
          </svelte:fragment>
        </Tooltip>
      </div>
      <span class="text-sm">15.0%</span>
    </div>
  </div>
  <Button full>Select</Button>
</article>

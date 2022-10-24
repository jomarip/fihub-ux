<script>
  import { page } from '$app/stores';
  let crumbs = $page.routeId.split('/');

  function constructLink(crumb, index) {
    // TODO: dirty fix, improve later when switch from hardcoding towards
    if (crumb === 'options' && index === 2) {
      return $page.routeId?.slice(0, $page.routeId.indexOf(crumb)) + crumb;
    }
    return $page.routeId?.slice(0, $page.routeId.lastIndexOf(crumb)) + crumb;
  }
</script>

<div class="mb-2 flex capitalize text-white">
  {#each crumbs as crumb, index}
    <a href={`/${constructLink(crumb, index)}`}>{crumb} </a>
    {#if index !== crumbs.length - 1}
      <span class="mx-1">/</span>
    {/if}
  {/each}
</div>

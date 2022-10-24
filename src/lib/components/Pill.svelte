<script lang="ts">

  // Initializations:
  export let type: 'primary' | 'secondary' | 'danger' | 'warning' | 'success' = 'primary';
  export let icon: string | undefined = undefined;

</script>

<!-- #################################################################################################### -->

<div class="pill" class:primary={type === 'primary'} class:secondary={type === 'secondary'} class:danger={type === 'danger'} class:warning={type === 'warning'} class:success={type === 'success'}>
  {#if icon}
    <i class="icofont-{icon}" />
  {/if}
  <span>
    <slot />
  </span>
</div>

<!-- #################################################################################################### -->

<style>

  div.pill {
    display: inline-flex;
    align-items: center;
    gap: .3em;
    padding: .2em .5em .3em;
    border-radius: 1em;
  }

  div.pill.primary {
    color: #40e0d0;
    background: #c4e0d0;
  }

  div.pill.secondary {
    color: #c1c1c1;
    background: #c9c9c91a;
  }

  div.pill.secondary > i {
    margin-top: .15em;
  }

  div.pill.danger {
    color: #ff0000;
    background: #ffbbbb;
  }

  div.pill.warning {
    color: #ffa500;
    background: #ffecc8;
  }

  div.pill.success {
    color: #008000;
    background: #b0dab0;
  }

  div.pill > span {
    font-size: .8em;
    white-space: nowrap;
  }

</style>
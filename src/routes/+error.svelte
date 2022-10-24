<script lang="ts">

	// Imports:
	import { onMount } from 'svelte';
	import { store } from '$lib/stores';
	import { goto } from '$app/navigation';

	onMount(() => {
		if($store.address) {
			goto(`/portfolio/${$store.address}`);
		} else {
			goto('/');
		}
	});
	
</script>
<script lang="ts">
  import { page } from '$app/state';
  import { fly } from 'svelte/transition';
  import favicon from '$lib/assets/favicon.svg';
  import "../app.css";
  import Navbar from '$lib/components/Navbar.svelte';
  
  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>
<Navbar />

{#key page.url.pathname}
  <div 
    in:fly={{ x: 100, duration: 300, delay: 300 }} 
    out:fly={{ x: -100, duration: 300 }}
  >
    {@render children?.()}
  </div>
{/key}

<style>
  :global(body) {
    overflow-x: hidden;
    background-color: white;
  }
</style>
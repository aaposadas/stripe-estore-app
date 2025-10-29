<script lang="ts">
  import { signOut } from '@auth/sveltekit/client';
  import { page } from '$app/state';
  
  // Get session from page data
  $: session = page.data.session;
  $: user = session?.user;
  
  async function handleSignOut() {
    await signOut({ callbackUrl: '/' });
  }
</script>

<nav class="bg-white border-b border-gray-200">
  <div class="max-w-7xl mx-auto px-4">
    <div class="flex justify-between items-center h-16">
      <!-- Logo/Brand -->
      <a href="/" class="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
        <span class="text-2xl">🐱</span>
        <span>Andrew's Catfe</span>
      </a>
      
      <!-- Auth Section -->
      <div class="flex items-center gap-3">
        {#if user}
          <!-- Logged In -->
          <span class="text-gray-700 text-sm hidden sm:inline">
            Hello, <span class="font-semibold">{user.name || user.email}</span>
          </span>
          <button
            on:click={handleSignOut}
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        {:else}
          <!-- Logged Out -->
          <a
            href="/login"
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Sign In
          </a>
          <a
            href="/register"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Sign Up
          </a>
        {/if}
      </div>
    </div>
  </div>
</nav>
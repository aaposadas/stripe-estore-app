<script lang="ts">
  import { signIn } from '@auth/sveltekit/client';
  
  let email = '';
  let password = '';
  let error = '';
  let loading = false;
  
  async function handleLogin() {
    loading = true;
    error = '';
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      });
      
      if (result?.error) {
        error = 'Invalid email or password';
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      error = 'An error occurred. Please try again.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
  <div class="max-w-md w-full bg-white rounded-lg shadow-sm p-8">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
      <p class="text-gray-600">Sign in to your account</p>
    </div>
    
    <form on:submit|preventDefault={handleLogin} class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          bind:value={email}
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="you@example.com"
        />
      </div>
      
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          bind:value={password}
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="••••••••"
        />
      </div>
      
      {#if error}
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      {/if}
      
      <button
        type="submit"
        disabled={loading}
        class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
    
    <div class="mt-6 text-center">
      <p class="text-gray-600">
        Don't have an account?
        <a href="/register" class="text-blue-600 hover:text-blue-700 font-semibold">
          Sign up
        </a>
      </p>
      <a href="/" class="text-gray-600 hover:text-gray-700 text-sm mt-4 inline-block">
        Continue as guest
      </a>
    </div>
  </div>
</div>
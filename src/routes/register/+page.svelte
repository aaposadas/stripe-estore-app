<script lang="ts">
  import { goto } from '$app/navigation';
  
  let email = '';
  let password = '';
  let name = '';
  let error = '';
  let loading = false;
  
  async function handleRegister() {
    loading = true;
    error = '';
    
    if (password.length < 8) {
      error = 'Password must be at least 8 characters';
      loading = false;
      return;
    }
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        error = result.error || 'Registration failed';
        loading = false;
        return;
      }
      
      // Redirect to login
      goto('/login');
    } catch (err) {
      error = 'An error occurred. Please try again.';
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
  <div class="max-w-md w-full bg-white rounded-lg shadow-sm p-8">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
      <p class="text-gray-600">Join Andrew's Catfe</p>
    </div>
    
    <form on:submit|preventDefault={handleRegister} class="space-y-4">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
          Name
        </label>
        <input
          id="name"
          type="text"
          bind:value={name}
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Your name"
        />
      </div>
      
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
        <p class="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
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
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
    
    <div class="mt-6 text-center">
      <p class="text-gray-600">
        Already have an account?
        <a href="/login" class="text-blue-600 hover:text-blue-700 font-semibold">
          Sign in
        </a>
      </p>
    </div>
  </div>
</div>
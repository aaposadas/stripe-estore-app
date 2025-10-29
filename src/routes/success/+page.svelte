<script lang="ts">
  import { onMount } from 'svelte';
  
    export let data;
  
  onMount(() => {
    sessionStorage.removeItem('cart');
  });
</script>

<div class="min-h-screen bg-gray-50 py-12 px-4">
  <div class="max-w-2xl mx-auto">
    <!-- Success Header -->
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
        <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
      <p class="text-gray-600">Thank you for your purchase</p>
    </div>
    
    {#if data.status === 'processing'}
      <!-- Processing State -->
      <div class="bg-white rounded-lg shadow-sm p-8 mb-6">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-700 mb-2">Processing your payment of <strong>${data.order.totalAmount?.toFixed(2)}</strong></p>
          <p class="text-sm text-gray-600">
            You'll receive a confirmation email at <strong>{data.order.email}</strong> shortly.
          </p>
        </div>
      </div>
    {:else if data.order}
      <!-- Receipt -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <!-- Receipt Header -->
        <div class="bg-linear-to-r from-blue-600 to-blue-700 text-white px-8 py-6">
          <div class="flex items-center justify-center mb-2">
            <span class="text-4xl mr-2">🐱</span>
            <h2 class="text-2xl font-bold">Andrew's Catfe</h2>
          </div>
          <p class="text-center text-blue-100 text-sm">Order Receipt</p>
        </div>
        
        <!-- Receipt Body -->
        <div class="px-8 py-6">
          <!-- Order Info -->
          <div class="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Order Number</p>
              <p class="text-lg font-semibold text-gray-900">#{data.order.id}</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Date</p>
              <p class="text-lg font-semibold text-gray-900">
                {new Date(data.order.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>
          
          <!-- Email -->
          <div class="mb-6 pb-6 border-b border-gray-200">
            <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
            <p class="text-gray-900">{data.order.email}</p>
          </div>
          
          <!-- Order Items -->
          <div class="mb-6">
            <p class="text-xs text-gray-500 uppercase tracking-wide mb-4">Items</p>
            <div class="space-y-4">
              {#each data.order.items as item}
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <p class="font-medium text-gray-900">{item.name}</p>
                    <p class="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p class="font-medium text-gray-900 ml-4">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              {/each}
            </div>
          </div>
          
          <!-- Total -->
          <div class="border-t-2 border-gray-900 pt-4">
            <div class="flex justify-between items-center">
              <span class="text-lg font-bold text-gray-900">Total</span>
              <span class="text-2xl font-bold text-gray-900">
                ${data.order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Receipt Footer -->
        <div class="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <div class="flex items-center justify-center text-sm text-gray-600">
            <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            Receipt sent to {data.order.email}
          </div>
        </div>
      </div>
    {/if}
    
    <!-- Action Buttons -->
    <div class="space-y-3">
      <a 
        href="/" 
        class="block w-full bg-blue-600 text-white text-center px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
      >
        Continue Shopping
      </a>
      <button
        class="block w-full bg-white text-gray-700 text-center px-6 py-4 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-gray-300"
        on:click={() => window.print()}
      >
        Print Receipt
      </button>
    </div>
  </div>
</div>

<style>
  @media print {

    button, a {
      display: none !important;
    }
  }
</style>
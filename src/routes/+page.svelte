<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  
  let { data } = $props();
  
  // Cart state - stores product id and quantity
  let cart: { [key: number]: number } = $state({});
  let mounted = $state(false);
  
  // Load cart from memory on mount
  onMount(() => {
    const savedCart = sessionStorage.getItem('cart');
    if (savedCart) {
      cart = JSON.parse(savedCart);
    }
    mounted = true;
  });
  
  // Save cart to memory whenever it changes
  $effect(() => {
    if (mounted) {
      sessionStorage.setItem('cart', JSON.stringify(cart));
    }
  });
  
  // Calculate cart total
  let cartTotal = $derived(
    Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = data.products.find(p => p.id === Number(productId));
      return total + (product ? product.price * quantity : 0);
    }, 0)
  );
  
  // Get cart items with product details
  let cartItems = $derived(
    Object.entries(cart)
      .map(([productId, quantity]) => ({
        product: data.products.find(p => p.id === Number(productId)),
        quantity
      }))
      .filter(item => item.product)
  );
  
  function addToCart(productId: number) {
    cart[productId] = (cart[productId] || 0) + 1;
  }
  
  function updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      delete cart[productId];
    } else {
      cart[productId] = quantity;
    }
  }
  
  function removeFromCart(productId: number) {
    delete cart[productId];
  }
  
  function handleCheckout() {
    goto('/checkout');
  }
  
  async function downloadReceipt(orderId: number) {
    window.open(`/api/orders/${orderId}/receipt`, '_blank');
  }
</script>

<div class="max-w-7xl mx-auto px-4 py-8">
<div class="flex flex-col lg:flex-row gap-6 items-start">    <!-- Left Column - Products -->
    <div class="flex-1">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each data.products as product}
          <div class="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
            {#if product.imageUrl}
              <img 
                src={product.imageUrl} 
                alt={product.name}
                class="w-full h-48 object-cover rounded-md mb-4"
              />
            {:else}
              <div class="w-full h-48 bg-gray-100 rounded-md mb-4 flex items-center justify-center text-gray-400">
                No Image
              </div>
            {/if}
            
            <h3 class="text-lg font-semibold mb-2">{product.name}</h3>
            {#if product.description}
              <p class="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
            {/if}
            <p class="text-blue-600 text-xl font-bold mb-4">${product.price.toFixed(2)}</p>
            
            <div class="flex gap-2">
              {#if cart[product.id]}
                <div class="flex items-center gap-2 flex-1">
                  <button
                    onclick={() => updateQuantity(product.id, cart[product.id] - 1)}
                    class="w-8 h-8 rounded border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span class="flex-1 text-center font-semibold">{cart[product.id]}</span>
                  <button
                    onclick={() => updateQuantity(product.id, cart[product.id] + 1)}
                    class="w-8 h-8 rounded border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              {:else}
                <button
                  onclick={() => addToCart(product.id)}
                  class="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Add to Cart
                </button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
    
    <!-- Right Column - Cart -->
    <div class="w-80 shrink-0">
      <div class="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
        <h2 class="text-2xl font-bold mb-4">Shopping Cart</h2>
        
        {#if cartItems.length === 0}
          <p class="text-gray-500 text-center py-8">Your cart is empty</p>
        {:else}
          <div class="space-y-3 mb-4 max-h-96 overflow-y-auto">
            {#each cartItems as { product, quantity }}
              {#if product}
                <div class="border-b border-gray-100 pb-3">
                  <div class="flex justify-between items-start mb-2">
                    <h4 class="font-semibold text-sm flex-1">{product.name}</h4>
                    <button 
                      onclick={() => removeFromCart(product.id)}
                      class="text-red-500 hover:text-red-700 text-xs ml-2"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div class="flex justify-between items-center">
                    <div class="flex items-center gap-2">
                      <button
                        onclick={() => updateQuantity(product.id, quantity - 1)}
                        class="w-6 h-6 rounded border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
                      >
                        -
                      </button>
                      <span class="w-8 text-center">{quantity}</span>
                      <button
                        onclick={() => updateQuantity(product.id, quantity + 1)}
                        class="w-6 h-6 rounded border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                    
                    <span class="font-semibold text-blue-600">
                      ${(product.price * quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              {/if}
            {/each}
          </div>
          
          <div class="border-t border-gray-200 pt-4">
            <div class="flex justify-between items-center mb-4">
              <span class="text-lg font-bold">Total:</span>
              <span class="text-2xl font-bold text-blue-600">${cartTotal.toFixed(2)}</span>
            </div>
            
            <button 
              onclick={handleCheckout}
              class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Checkout
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<!-- Order History Section -->
<div class="max-w-7xl mx-auto px-4 py-12">
  <div class="border-t border-gray-200 pt-12">
    <h2 class="text-2xl font-bold mb-6">Recent Orders</h2>
    
    {#if data.session?.user}
      {#if data.orders.length === 0}
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p class="text-gray-600">You haven't placed any orders yet.</p>
        </div>
      {:else}
        <div class="space-y-4">
          {#each data.orders as order}
            <div class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <p class="text-sm text-gray-500">Order #{order.id}</p>
                  <p class="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-bold text-gray-900">${order.totalAmount.toFixed(2)}</p>
                  <span class="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {order.status}
                  </span>
                </div>
              </div>
              
              <div class="mb-4">
                <p class="text-sm font-medium text-gray-700 mb-2">Items:</p>
                <div class="space-y-1">
                  {#each order.orderItems as item}
                    <div class="flex justify-between text-sm text-gray-600">
                      <span>{item.product.name} × {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  {/each}
                </div>
              </div>
              
              <button
                onclick={() => downloadReceipt(order.id)}
                class="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Receipt
              </button>
            </div>
          {/each}
        </div>
      {/if}
    {:else}
      <!-- Not logged in -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">View Your Order History</h3>
        <p class="text-gray-600 mb-6">Sign in or create an account to track your orders and download receipts.</p>
        <div class="flex gap-3 justify-center">
          <a href="/login" class="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Sign In
          </a>
          <a href="/register" class="px-6 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Sign Up
          </a>
        </div>
      </div>
    {/if}
  </div>
</div>
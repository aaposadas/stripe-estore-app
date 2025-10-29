<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js';
  import { PUBLIC_STRIPE_KEY } from '$env/static/public';
  import { goto } from '$app/navigation';
  
  export let data;
  
  let stripe: Stripe | null = null;
  let elements: StripeElements | null = null;
  let paymentElement: any = null;
  let clientSecret = '';
  let loading = false;
  let processing = false;
  let errorMessage = '';
  let amount = 0;
  let showPaymentForm = false;
  let email = '';
  let emailError = '';
  
  let cart: { [key: number]: number } = {};
  
  // Check if user is authenticated and auto-fill email
  $: isAuthenticated = !!data.userEmail;
  $: if (isAuthenticated && data.userEmail) {
    email = data.userEmail;
  }
  
  function handleCancel() {
    goto('/');
  }
  
  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  async function handleContinue() {
    emailError = '';
    
    if (!email) {
      emailError = 'Email is required';
      return;
    }
    
    if (!validateEmail(email)) {
      emailError = 'Please enter a valid email';
      return;
    }
    
    loading = true;
    
    try {
      // Call API to create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cart, email })
      });
      
      const result = await response.json();
            
      if (result.error) {
        errorMessage = result.error;
        loading = false;
        return;
      }
      
      if (!result.clientSecret) {
        errorMessage = 'Failed to initialize payment';
        loading = false;
        return;
      }
      
      clientSecret = result.clientSecret;
      amount = result.amount;
            
      // Initialize Stripe if not already done
      if (!stripe) {
        stripe = await loadStripe(PUBLIC_STRIPE_KEY);
      }
      
      // Show the payment form first
      showPaymentForm = true;
      loading = false;
      
      // Wait for DOM to update
      await tick();
      
      // Now mount Stripe Elements
      if (stripe && clientSecret) {
        const paymentElementDiv = document.querySelector('#payment-element');
        if (!paymentElementDiv) {
          console.error('Payment element div not found!');
          errorMessage = 'Failed to load payment form';
          return;
        }
        
        elements = stripe.elements({ clientSecret });
        paymentElement = elements.create('payment', {
          defaultValues: {
            billingDetails: {
              email: email
            }
          },
          fields: {
            billingDetails: {
              email: 'never'
            }
          },
          terms: {
            card: 'never'
          }
        });
        paymentElement.mount('#payment-element');
        console.log('Payment element mounted successfully');
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      errorMessage = 'Failed to initialize payment';
      loading = false;
    }
  }
  
  onMount(async () => {
    // Load cart
    const savedCart = sessionStorage.getItem('cart');
    if (!savedCart) {
      goto('/');
      return;
    }
    cart = JSON.parse(savedCart);
    
    // If user is authenticated, skip email step and go straight to payment
    if (isAuthenticated && data.userEmail) {
      await handleContinue();
    }
  });
  
  async function handleSubmit(e: Event) {
    e.preventDefault();
    
    if (!stripe || !elements || !paymentElement) {
      console.error('Stripe not initialized');
      return;
    }
    
    processing = true;
    errorMessage = '';
    
    // Small delay to ensure elements are fully ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/success`,
          receipt_email: email,
                payment_method_data: {
          billing_details: {
            email: email  
          }
        }
        },
      });
      
      if (result.error) {
        errorMessage = result.error.message || 'Payment failed';
        processing = false;
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      errorMessage = 'An unexpected error occurred';
      processing = false;
    }
  }
</script>

<div class="max-w-2xl mx-auto px-4 py-8">
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-3xl font-bold">Checkout</h1>
    <button 
      on:click={handleCancel}
      class="text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
      </svg>
      Back to Shop
    </button>
  </div>
  
  {#if !showPaymentForm && !isAuthenticated}
    <!-- Email Collection Step (only for guests) -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-4">Contact Information</h2>
      <div class="border border-gray-200 rounded-lg p-6 bg-white">
        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          bind:value={email}
          placeholder="you@example.com"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          on:keydown={(e) => e.key === 'Enter' && handleContinue()}
        />
        {#if emailError}
          <p class="text-red-600 text-sm mt-2">{emailError}</p>
        {/if}
        <p class="text-gray-500 text-sm mt-2">We'll send your receipt to this email.</p>
        
        <button
          on:click={handleContinue}
          disabled={loading}
          class="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          {loading ? 'Loading...' : 'Continue to Payment'}
        </button>
      </div>
    </div>
  {:else if loading}
    <div class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Loading payment form...</p>
    </div>
  {:else if errorMessage}
    <div>
      <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
        {errorMessage}
      </div>
      <button 
        on:click={() => { showPaymentForm = false; errorMessage = ''; }}
        class="text-blue-600 hover:text-blue-700 underline"
      >
        Go back
      </button>
    </div>
  {:else if showPaymentForm}
  <!-- note concerning demo site, can be omitted in real prod scenario -->
  <span class="text-gray-700 mb-6 block">Test Stripe API: Demo does not accept real payment</span> 
  
    <!-- Payment Step -->
    <div class="mb-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div class="flex justify-between items-center text-sm text-gray-600 mb-2">
        <span>Email:</span>
        <span class="font-medium">{email}</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-lg font-semibold">Total Amount:</span>
        <span class="text-2xl font-bold text-blue-600">${amount.toFixed(2)}</span>
      </div>
    </div>
    
    <form on:submit={handleSubmit}>
      <div id="payment-element" class="mb-4"></div>
      
      <div class="flex gap-3">
        <button
          type="button"
          on:click={() => { showPaymentForm = false; }}
          class="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={processing || !stripe || !elements}
          class="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          {processing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
        </button>
      </div>
    </form>
  {/if}
</div>
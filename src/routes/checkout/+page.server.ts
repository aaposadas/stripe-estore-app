import { stripe } from "$lib/server/stripe";
import { prisma } from "$lib/server/prisma";
import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();

  return {
    session,
    userEmail: session?.user?.email || null,
  };
};

export const actions = {
  createPaymentIntent: async ({ request }) => {
    try {
      const data = await request.formData();
      const cartJson = data.get("cart") as string;
      const cart = JSON.parse(cartJson);

      // Get product details from database
      const productIds = Object.keys(cart).map(Number);
      const products = await prisma.product.findMany({
        where: {
          id: { in: productIds },
        },
      });

      // Calculate total amount
      let totalAmount = 0;
      products.forEach((product) => {
        const quantity = cart[product.id];
        totalAmount += product.price * quantity * 100;
      });

      // Create Payment Intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount),
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: "never",
        },
        metadata: {
          cart: JSON.stringify(cart),
        },
      });

      // Return the client secret directly
      return {
        clientSecret: paymentIntent.client_secret,
        products,
        cart,
      };
    } catch (error) {
      console.error("Payment Intent error:", error);
      return fail(500, { error: "Failed to create payment intent" });
    }
  },
} satisfies Actions;

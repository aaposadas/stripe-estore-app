import { json } from "@sveltejs/kit";
import { stripe } from "$lib/server/stripe";
import { prisma } from "$lib/server/prisma";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { cart, email } = await request.json(); // Add email

    if (!email) {
      return json({ error: "Email is required" }, { status: 400 });
    }

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
      totalAmount += product.price * quantity * 100; // Stripe uses cents
    });

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount),
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: email, // Send receipt to this email
      metadata: {
        cart: JSON.stringify(cart),
        email: email,
      },
    });

    return json({
      clientSecret: paymentIntent.client_secret,
      amount: totalAmount / 100,
    });
  } catch (error) {
    console.error("Payment Intent error:", error);
    return json({ error: "Failed to create payment intent" }, { status: 500 });
  }
};

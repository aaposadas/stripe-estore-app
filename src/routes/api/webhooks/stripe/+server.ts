import { json } from "@sveltejs/kit";
import { stripe } from "$lib/server/stripe";
import { prisma } from "$lib/server/prisma";
import { SECRET_STRIPE_WEBHOOK_SECRET } from "$env/static/private";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return json({ error: "No signature" }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      SECRET_STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    try {
      const cart = JSON.parse(paymentIntent.metadata.cart);
      const email = paymentIntent.metadata.email;

      // Try to find user by email
      const user = await prisma.user.findUnique({
        where: { email: email },
      });

      const productIds = Object.keys(cart).map(Number);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      const order = await prisma.order.create({
        data: {
          email: email,
          userId: user?.id || null, // Link to user if they exist
          totalAmount: paymentIntent.amount / 100,
          stripeSessionId: paymentIntent.id,
          status: "COMPLETED",
          orderItems: {
            create: products.map((product) => ({
              productId: product.id,
              quantity: cart[product.id],
              price: product.price,
            })),
          },
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      console.log("Order created:", order.id);
    } catch (error) {
      console.error("Error creating order:", error);
      return json({ error: "Failed to create order" }, { status: 500 });
    }
  }

  return json({ received: true });
};

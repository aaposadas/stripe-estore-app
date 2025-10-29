import { json } from "@sveltejs/kit";
import { stripe } from "$lib/server/stripe";
import { prisma } from "$lib/server/prisma";
import { SECRET_STRIPE_WEBHOOK_SECRET } from "$env/static/private";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  console.log("Webhook received");

  if (!signature) {
    console.error("No signature provided");
    return json({ error: "No signature" }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      SECRET_STRIPE_WEBHOOK_SECRET
    );
    console.log("Webhook verified, event type:", event.type);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    try {
      console.log("Processing payment intent:", paymentIntent.id);

      // Check if order already exists
      const existingOrder = await prisma.order.findUnique({
        where: {
          stripeSessionId: paymentIntent.id,
        },
      });

      if (existingOrder) {
        console.log("Order already exists:", existingOrder.id);
        return json({ received: true, orderId: existingOrder.id });
      }

      const cart = JSON.parse(paymentIntent.metadata.cart);
      const email = paymentIntent.metadata.email;

      console.log("Cart:", cart);
      console.log("Email:", email);

      const user = await prisma.user.findUnique({
        where: { email: email },
      });

      console.log("User found:", user?.id);

      const productIds = Object.keys(cart).map(Number);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      console.log("Products found:", products.length);

      if (products.length === 0) {
        console.error("No products found for cart:", cart);
        return json({ error: "Products not found" }, { status: 400 });
      }

      const order = await prisma.order.create({
        data: {
          email: email,
          userId: user?.id || null,
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

      console.log("Order created successfully:", order.id);
    } catch (error) {
      console.error("Error creating order:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      return json({ error: "Failed to create order" }, { status: 500 });
    }
  }

  return json({ received: true });
};

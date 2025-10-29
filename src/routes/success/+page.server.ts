import { stripe } from "$lib/server/stripe";
import { prisma } from "$lib/server/prisma";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, locals }) => {
  const paymentIntentId = url.searchParams.get("payment_intent");

  if (!paymentIntentId) {
    throw redirect(303, "/");
  }

  try {
    // Get payment details from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      throw redirect(303, "/");
    }

    // Try to get order from database
    let order = await prisma.order.findFirst({
      where: {
        stripeSessionId: paymentIntentId,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    // If no order exists, create it now (fallback if webhook hasn't run yet)
    if (!order) {
      try {
        const cart = JSON.parse(paymentIntent.metadata.cart);
        const email = paymentIntent.metadata.email;

        // Get product details
        const productIds = Object.keys(cart).map(Number);
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
        });

        // Create order
        const session = await locals.auth();

        order = await prisma.order.create({
          data: {
            email: email,
            userId: session?.user?.id ? parseInt(session.user.id) : null, // Add this line
            totalAmount: paymentIntent.amount / 100,
            stripeSessionId: paymentIntentId,
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
      } catch (createError: any) {
        // If order creation fails due to duplicate (race condition with webhook), fetch it again
        if (createError.code === "P2002") {
          order = await prisma.order.findFirst({
            where: {
              stripeSessionId: paymentIntentId,
            },
            include: {
              orderItems: {
                include: {
                  product: true,
                },
              },
            },
          });
        } else {
          throw createError;
        }
      }
    }

    // If still no order (shouldn't happen), show error
    if (!order) {
      throw new Error("Order not found");
    }

    return {
      status: "success",
      order: {
        id: order.id,
        email: order.email,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt.toISOString(),
        items: order.orderItems.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    };
  } catch (error) {
    console.error("Error retrieving payment:", error);
    throw redirect(303, "/");
  }
};

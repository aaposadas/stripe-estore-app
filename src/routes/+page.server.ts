import { prisma } from "$lib/server/prisma";
import type { PageServerLoad } from "./$types";
import type { Order, OrderItem, Product } from "@prisma/client";

// Define the order type with includes
type OrderWithItems = Order & {
  orderItems: (OrderItem & {
    product: Product;
  })[];
};

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();

  // Get products
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get user's orders if authenticated
  let orders: OrderWithItems[] = [];
  if (session?.user?.email) {
    orders = await prisma.order.findMany({
      where: {
        email: session.user.email,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  return {
    products,
    orders,
    session,
  };
};

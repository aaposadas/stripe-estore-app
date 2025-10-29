import { error } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, locals }) => {
  const session = await locals.getSession();

  if (!session?.user?.email) {
    throw error(401, "Unauthorized");
  }

  const orderId = parseInt(params.orderId);

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      email: session.user.email, // Ensure user can only access their own orders
    },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    throw error(404, "Order not found");
  }

  // Generate HTML receipt
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Receipt - Order #${order.id}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          max-width: 800px;
          margin: 40px auto;
          padding: 20px;
          background: #f9fafb;
        }
        .receipt {
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(to right, #2563eb, #1d4ed8);
          color: white;
          padding: 40px;
          text-align: center;
        }
        .header h1 {
          margin: 0 0 8px 0;
          font-size: 32px;
        }
        .header p {
          margin: 0;
          opacity: 0.9;
        }
        .content {
          padding: 40px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          margin-bottom: 32px;
          padding-bottom: 32px;
          border-bottom: 1px solid #e5e7eb;
        }
        .info-item label {
          display: block;
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .info-item div {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }
        .items-table {
          width: 100%;
          margin-bottom: 32px;
        }
        .items-table th {
          text-align: left;
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e5e7eb;
        }
        .items-table td {
          padding: 16px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        .item-name {
          font-weight: 500;
          color: #111827;
        }
        .item-qty {
          color: #6b7280;
          font-size: 14px;
        }
        .total-row {
          border-top: 2px solid #111827;
          padding-top: 16px;
          margin-top: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .total-row .label {
          font-size: 20px;
          font-weight: 700;
        }
        .total-row .amount {
          font-size: 32px;
          font-weight: 700;
          color: #111827;
        }
        .footer {
          background: #f9fafb;
          padding: 24px 40px;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
        @media print {
          body {
            background: white;
            margin: 0;
          }
          .receipt {
            box-shadow: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <h1>🐱 Andrew's Catfe</h1>
          <p>Order Receipt</p>
        </div>
        
        <div class="content">
          <div class="info-grid">
            <div class="info-item">
              <label>Order Number</label>
              <div>#${order.id}</div>
            </div>
            <div class="info-item">
              <label>Date</label>
              <div>${new Date(order.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}</div>
            </div>
            <div class="info-item">
              <label>Email</label>
              <div>${order.email}</div>
            </div>
            <div class="info-item">
              <label>Status</label>
              <div>${order.status}</div>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: right">Qty</th>
                <th style="text-align: right">Price</th>
                <th style="text-align: right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.orderItems
                .map(
                  (item) => `
                <tr>
                  <td class="item-name">${item.product.name}</td>
                  <td style="text-align: right" class="item-qty">${
                    item.quantity
                  }</td>
                  <td style="text-align: right">$${item.price.toFixed(2)}</td>
                  <td style="text-align: right">$${(
                    item.price * item.quantity
                  ).toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          
          <div class="total-row">
            <span class="label">Total</span>
            <span class="amount">$${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for your purchase!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
      "Content-Disposition": `inline; filename="receipt-${order.id}.html"`,
    },
  });
};

# Andrew's Catfe ☕🐱

A modern, full-stack e-commerce platform for a cat-themed cafe, built with SvelteKit 5, Stripe payments, and PostgreSQL.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![SvelteKit](https://img.shields.io/badge/SvelteKit-5.0-FF3E00?logo=svelte)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)

## ✨ Features

### Shopping Experience
- 🛒 **Dynamic Shopping Cart** - Real-time cart updates with quantity controls
- 💾 **Session Persistence** - Cart saved in browser session storage
- 📱 **Responsive Design** - Optimized for mobile, tablet, and desktop
- ✨ **Smooth Transitions** - Page transitions with Svelte 5 animations

### Payments & Checkout
- 💳 **Stripe Integration** - Secure payment processing with custom checkout
- 🔒 **PCI Compliant** - Card details handled securely by Stripe Elements
- 📧 **Guest Checkout** - No account required to make purchases
- 🧾 **Email Receipts** - Automatic receipt delivery via Stripe

### User Authentication
- 👤 **Optional Auth** - Users can shop as guests or create accounts
- 🔐 **Secure Login** - Password hashing with bcrypt
- 📜 **Order History** - Logged-in users can view past orders
- 📥 **Receipt Downloads** - Beautiful HTML receipts for printing/saving

### Admin Features
- 📦 **Order Management** - All orders stored in PostgreSQL database
- 🔗 **User Linking** - Orders automatically linked to registered users
- 🪝 **Webhook Support** - Stripe webhooks for reliable order creation

## 🛠️ Tech Stack

### Frontend
- **[SvelteKit 5](https://kit.svelte.dev/)** - Full-stack framework with runes mode
- **[TailwindCSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Svelte 5](https://svelte.dev/)** - Reactive UI framework with latest runes API

### Backend
- **[SvelteKit API Routes](https://kit.svelte.dev/docs/routing#server)** - Server-side endpoints
- **[Prisma ORM](https://www.prisma.io/)** - Type-safe database client
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database (via Supabase)

### Payments & Auth
- **[Stripe](https://stripe.com/)** - Payment processing and checkout
- **[Auth.js](https://authjs.dev/)** - Authentication with credentials provider
- **[bcrypt](https://www.npmjs.com/package/bcrypt)** - Password hashing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (or Supabase account)
- Stripe account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/e-store-app.git
   cd e-store-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@host:port/database"

   # Stripe
   SECRET_STRIPE_KEY="sk_test_..."
   PUBLIC_STRIPE_KEY="pk_test_..."
   SECRET_STRIPE_WEBHOOK_SECRET="whsec_..."

   # Auth
   SECRET_AUTH_SECRET="generate_with_openssl_rand_base64_32"
   ```

   Generate auth secret:
   ```bash
   openssl rand -base64 32
   ```

4. **Set up database**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Seed products (optional)**
   
   Use Prisma Studio to add products:
   ```bash
   npx prisma studio
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173)

### Stripe Webhook Testing (Local)

1. **Install Stripe CLI**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Windows
   scoop install stripe
   ```

2. **Forward webhooks to local server**
   ```bash
   stripe login
   stripe listen --forward-to localhost:5173/api/webhooks/stripe
   ```

3. **Copy webhook secret** from CLI output to `.env`

## 📁 Project Structure

```
e-store-app/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   └── Navbar.svelte  # Navigation component
│   │   └── server/
│   │       ├── prisma.ts      # Prisma client
│   │       └── stripe.ts      # Stripe client
│   ├── routes/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── register/  # User registration endpoint
│   │   │   ├── create-payment-intent/  # Stripe payment intent
│   │   │   ├── orders/
│   │   │   │   └── [orderId]/receipt/  # Receipt download
│   │   │   └── webhooks/
│   │   │       └── stripe/    # Stripe webhook handler
│   │   ├── checkout/          # Checkout page
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   ├── success/           # Order confirmation
│   │   ├── +layout.svelte     # Root layout with navbar
│   │   ├── +layout.server.ts  # Session management
│   │   └── +page.svelte       # Home page (products + cart)
│   ├── app.css                # Global styles
│   └── hooks.server.ts        # Auth.js configuration
└── package.json
```

## 🗄️ Database Schema

```prisma
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  name      String?
  password  String?
  createdAt DateTime  @default(now())
  orders    Order[]
}

model Product {
  id              Int         @id @default(autoincrement())
  name            String
  description     String?
  price           Float
  imageUrl        String?
  stripeProductId String?     @unique
  stripePriceId   String?     @unique
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  orderItems      OrderItem[]
}

model Order {
  id              Int         @id @default(autoincrement())
  userId          Int?
  user            User?       @relation(fields: [userId], references: [id])
  email           String
  totalAmount     Float
  stripeSessionId String?     @unique
  status          String      @default("PENDING")
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  orderItems      OrderItem[]
}

model OrderItem {
  id        Int     @id @default(autoincrement())
  orderId   Int
  productId Int
  quantity  Int     @default(1)
  price     Float
  order     Order   @relation(fields: [orderId], references: [id])
  product   Product @relation(fields: [productId], references: [id])
}
```

## 🚢 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables from `.env`

3. **Configure Stripe Webhooks**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select event: `payment_intent.succeeded`
   - Copy signing secret and add to Vercel environment variables

4. **Switch to Production Keys**
   - Update `SECRET_STRIPE_KEY` and `PUBLIC_STRIPE_KEY` to live keys
   - Update `SECRET_STRIPE_WEBHOOK_SECRET` with production webhook secret

## 🧪 Testing

### Test Cards (Stripe Test Mode)
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- Use any future expiry date, any CVC, any ZIP code

## 🎯 Future Enhancements

- [ ] Email confirmations (Resend/SendGrid)
- [ ] Product search and filtering
- [ ] Admin dashboard for product management
- [ ] Inventory tracking
- [ ] Order status updates (shipping, delivered)
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Shipping cost calculator
- [ ] Multiple payment methods (Apple Pay, Google Pay)
- [ ] Discount codes and promotions


## 👤 Author

**Andrew Posdas**
- GitHub: [@aaposadas](https://github.com/aaposadas)
- LinkedIn: [Andrew Posadas](https://www.linkedin.com/in/andrew-posadas-644065142/)

## 🙏 Acknowledgments

- Images from [Pexels](https://www.pexels.com/)
- Icons from [Heroicons](https://heroicons.com/)
- Inspired by modern e-commerce platforms

---

Built with ❤️ using SvelteKit 5

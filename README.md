# SMS Food Delivery Application

A complete SMS-based food delivery system built with Next.js, Twilio, and Stripe. Customers can order food via SMS messages and pay through secure payment links.

## 🚀 Features

- **SMS-Based Ordering**: Customers order by replying to SMS with item numbers
- **Payment Processing**: Secure Stripe payment links sent via SMS
- **Admin Dashboard**: Manage menus, orders, customers, and SMS campaigns
- **Real-time Updates**: Order status tracking and automated notifications
- **Two-way SMS**: Customer registration, menu requests, and order responses

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Prisma ORM, PostgreSQL
- **SMS**: Twilio API
- **Payments**: Stripe API
- **Deployment**: Vercel
- **Testing**: Jest, React Testing Library, Playwright

## 📱 How It Works

1. **Admin creates daily menu** in the dashboard
2. **System broadcasts menu** via SMS to all active customers
3. **Customers reply with orders** (e.g., "Item 1 and Item 3")
4. **System generates payment link** and sends it via SMS
5. **Customer pays** using secure Stripe checkout
6. **Order status updates** automatically upon payment

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Customer SMS  │◄──►│   Next.js App   │◄──►│  Admin Dashboard│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                    ┌─────────┼─────────┐
                    │         │         │
            ┌───────▼───┐ ┌───▼───┐ ┌───▼────┐
            │  Twilio   │ │Stripe │ │Database│
            │  SMS API  │ │  API  │ │(Prisma)│
            └───────────┘ └───────┘ └────────┘
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Twilio account
- Stripe account

### 1. Clone and Install

\`\`\`bash
git clone https://github.com/yourusername/sms-food-delivery.git
cd sms-food-delivery
npm install
\`\`\`

### 2. Environment Setup

Create a \`.env\` file with your API keys:

\`\`\`env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/sms_food_delivery"

# Twilio Configuration
TWILIO_ACCOUNT_SID="your_twilio_account_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_PHONE_NUMBER="your_twilio_phone_number"

# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_stripe_webhook_secret"

# Application
NEXTAUTH_SECRET="your-super-secret-jwt-key"
NEXTAUTH_URL="http://localhost:3000"
APP_URL="http://localhost:3000"
\`\`\`

### 3. Database Setup

\`\`\`bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database with sample data
npm run db:seed
\`\`\`

### 4. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

The application will be available at \`http://localhost:3000\`

## 📊 Admin Dashboard

Visit \`/admin\` to access the admin dashboard with:

- **Dashboard**: Overview of orders, customers, and revenue
- **Menu Management**: Create daily menus with items and pricing
- **Customer Management**: View and manage customer database
- **Order Tracking**: Monitor order status and payments
- **SMS Campaigns**: Broadcast menus and send notifications

### Default Admin Login

After seeding the database:
- **Email**: admin@sms-food-delivery.com
- **Password**: admin123

## 📱 SMS Commands

Customers can interact via SMS:

- **"MENU"** - Get today's menu
- **"Item 1"** - Order item 1
- **"Item 1 and Item 3"** - Order multiple items
- **"HELP"** - Get assistance
- **"STOP"** - Unsubscribe from SMS
- **"START"** - Resubscribe to SMS

## 🔧 API Endpoints

### SMS Endpoints
- \`POST /api/webhooks/sms\` - Twilio webhook for incoming SMS
- \`POST /api/sms/broadcast\` - Broadcast menu to customers

### Payment Endpoints
- \`POST /api/orders/[orderId]/payment\` - Create payment link
- \`POST /api/webhooks/stripe\` - Stripe webhook for payments

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**:
   \`\`\`bash
   vercel login
   vercel link
   \`\`\`

2. **Set Environment Variables** in Vercel dashboard

3. **Deploy**:
   \`\`\`bash
   vercel --prod
   \`\`\`

### Environment Variables in Production

Add these in your Vercel project settings:

- \`DATABASE_URL\` - Production PostgreSQL URL
- \`TWILIO_ACCOUNT_SID\` - Your Twilio Account SID
- \`TWILIO_AUTH_TOKEN\` - Your Twilio Auth Token
- \`TWILIO_PHONE_NUMBER\` - Your Twilio phone number
- \`STRIPE_SECRET_KEY\` - Your Stripe secret key
- \`STRIPE_WEBHOOK_SECRET\` - Your Stripe webhook secret
- \`NEXTAUTH_SECRET\` - Random secure string
- \`APP_URL\` - Your production URL

### Webhook Configuration

1. **Twilio Webhook**: Set to \`https://your-domain.vercel.app/api/webhooks/sms\`
2. **Stripe Webhook**: Set to \`https://your-domain.vercel.app/api/webhooks/stripe\`

## 🧪 Testing

\`\`\`bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run all tests
npm run test:all
\`\`\`

## 📄 Database Schema

### Core Models

- **Customer**: Phone numbers, preferences, subscription status
- **Menu**: Daily menus with date and active status
- **MenuItem**: Individual food items with pricing
- **Order**: Customer orders with items and payment status
- **SmsLog**: SMS message tracking and history
- **AdminUser**: Admin authentication and roles

## 🔒 Security Features

- Environment variable validation
- SQL injection prevention with Prisma
- Webhook signature verification
- Input sanitization and validation
- Secure payment processing with Stripe

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature/new-feature\`
3. Commit changes: \`git commit -am 'Add new feature'\`
4. Push to branch: \`git push origin feature/new-feature\`
5. Submit a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Check the documentation
- Review the test files for usage examples

## 🎯 Roadmap

- [ ] Multi-restaurant support
- [ ] Order scheduling and delivery times
- [ ] Customer loyalty points system
- [ ] Advanced analytics and reporting
- [ ] Mobile app companion
- [ ] WhatsApp integration

---

Built with ❤️ using Next.js, Twilio, and Stripe
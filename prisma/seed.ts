import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@sms-food-delivery.com' },
    update: {},
    create: {
      email: 'admin@sms-food-delivery.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
    },
  })

  console.log('👤 Created admin user:', admin.email)

  // Create sample customers
  const customer1 = await prisma.customer.upsert({
    where: { phoneNumber: '+1234567890' },
    update: {},
    create: {
      phoneNumber: '+1234567890',
      name: 'John Doe',
      email: 'john@example.com',
      isActive: true,
    },
  })

  const customer2 = await prisma.customer.upsert({
    where: { phoneNumber: '+1987654321' },
    update: {},
    create: {
      phoneNumber: '+1987654321',
      name: 'Jane Smith',
      email: 'jane@example.com',
      isActive: true,
    },
  })

  console.log('👥 Created customers:', customer1.name, customer2.name)

  // Create today's menu
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const menu = await prisma.menu.upsert({
    where: { date: today },
    update: {},
    create: {
      date: today,
      title: "Today's Special Menu",
      isActive: true,
      menuItems: {
        create: [
          {
            name: 'Chicken Alfredo',
            description: 'Creamy pasta with grilled chicken and vegetables',
            price: 1299, // $12.99
            category: 'main',
            isAvailable: true,
          },
          {
            name: 'Caesar Salad',
            description: 'Fresh romaine lettuce with caesar dressing and croutons',
            price: 899, // $8.99
            category: 'appetizer',
            isAvailable: true,
          },
          {
            name: 'Chocolate Brownie',
            description: 'Rich chocolate brownie with vanilla ice cream',
            price: 599, // $5.99
            category: 'dessert',
            isAvailable: true,
          },
          {
            name: 'Grilled Salmon',
            description: 'Fresh Atlantic salmon with lemon herbs',
            price: 1599, // $15.99
            category: 'main',
            isAvailable: true,
          },
        ],
      },
    },
  })

  console.log('🍽️ Created menu for:', menu.date.toDateString())

  console.log('✅ Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
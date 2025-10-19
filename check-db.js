const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    const customers = await prisma.businessCustomer.findMany()
    console.log('All business customers in database:')
    console.log(JSON.stringify(customers, null, 2))

    const testCustomer = await prisma.businessCustomer.findUnique({
      where: { contactEmail: 'test@example.com' }
    })
    console.log('\nCustomer with test@example.com:')
    console.log(JSON.stringify(testCustomer, null, 2))
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()

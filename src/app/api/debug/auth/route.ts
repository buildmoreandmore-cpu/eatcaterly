import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getCurrentUserEmail, getCurrentUserBusinessId } from '@/lib/auth-utils.server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    console.log('[DEBUG /api/debug/auth] Starting auth debug')

    // Check Clerk user
    const user = await currentUser()
    console.log('[DEBUG] Clerk user exists:', !!user)
    console.log('[DEBUG] Clerk user ID:', user?.id)
    console.log('[DEBUG] Clerk user email addresses:', user?.emailAddresses)

    // Check email
    const email = await getCurrentUserEmail()
    console.log('[DEBUG] getCurrentUserEmail result:', email)

    // Check business
    const businessId = await getCurrentUserBusinessId()
    console.log('[DEBUG] getCurrentUserBusinessId result:', businessId)

    // If we have an email, manually check database
    let businessFromDb = null
    if (email) {
      businessFromDb = await prisma.businessCustomer.findFirst({
        where: {
          contactEmail: {
            equals: email,
            mode: 'insensitive'
          }
        },
        select: {
          id: true,
          businessName: true,
          contactEmail: true,
          onboardingCompleted: true
        }
      })
      console.log('[DEBUG] Manual business lookup result:', businessFromDb)
    }

    return NextResponse.json({
      clerkUser: user ? {
        id: user.id,
        emailAddresses: user.emailAddresses,
        primaryEmailAddressId: user.primaryEmailAddressId
      } : null,
      email,
      businessId,
      businessFromDb,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('[DEBUG /api/debug/auth] Error:', error)
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

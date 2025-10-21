import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1 as test`

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('[TEST-DB] Database test failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Database connection failed',
        stack: error.stack
      },
      { status: 500 }
    )
  }
}

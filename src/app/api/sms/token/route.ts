import { NextRequest, NextResponse } from 'next/server'
import { ezTextingAuth } from '@/lib/eztexting-auth'

export async function GET() {
  try {
    const tokenInfo = ezTextingAuth.getTokenInfo()

    return NextResponse.json({
      success: true,
      data: tokenInfo
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get token info'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action === 'refresh') {
      await ezTextingAuth.getValidAccessToken()
      const tokenInfo = ezTextingAuth.getTokenInfo()

      return NextResponse.json({
        success: true,
        data: {
          ...tokenInfo,
          message: 'Token refreshed successfully'
        }
      })
    }

    if (action === 'revoke') {
      await ezTextingAuth.revokeTokens()

      return NextResponse.json({
        success: true,
        data: {
          message: 'Tokens revoked successfully'
        }
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "refresh" or "revoke"' },
      { status: 400 }
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Token operation failed'
      },
      { status: 500 }
    )
  }
}
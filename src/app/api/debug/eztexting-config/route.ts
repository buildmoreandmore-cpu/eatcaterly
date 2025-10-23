import { NextResponse } from 'next/server'

export async function GET() {
  const username = process.env.EZTEXTING_USERNAME
  const password = process.env.EZTEXTING_PASSWORD
  const apiUrl = process.env.EZ_TEXTING_API_URL || 'https://app.eztexting.com'

  return NextResponse.json({
    hasUsername: !!username,
    hasPassword: !!password,
    usernameLength: username?.length || 0,
    passwordLength: password?.length || 0,
    usernameFirstChar: username?.charAt(0) || 'N/A',
    apiUrl,
    // Show first 3 chars only for security
    usernamePrefix: username?.substring(0, 3) || 'N/A',
  })
}

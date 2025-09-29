interface TokenData {
  accessToken: string
  refreshToken: string
  expiresAt: number // Unix timestamp
}

interface TokenResponse {
  accessToken: string
  refreshToken: string
  expiresInSeconds: number
}

class EZTextingAuth {
  private static instance: EZTextingAuth
  private tokenData: TokenData | null = null

  private constructor() {}

  static getInstance(): EZTextingAuth {
    if (!EZTextingAuth.instance) {
      EZTextingAuth.instance = new EZTextingAuth()
    }
    return EZTextingAuth.instance
  }

  /**
   * Initialize with existing tokens from environment variables
   */
  private initializeFromEnv(): void {
    const accessToken = process.env.EZTEXTING_ACCESS_TOKEN
    const refreshToken = process.env.EZTEXTING_REFRESH_TOKEN

    if (accessToken && refreshToken) {
      // Assume token expires in 90 minutes if we don't have exact expiry
      const expiresAt = Date.now() + (90 * 60 * 1000) // 90 minutes from now

      this.tokenData = {
        accessToken,
        refreshToken,
        expiresAt
      }
    }
  }

  /**
   * Check if current token is valid (not expired)
   */
  private isTokenValid(): boolean {
    if (!this.tokenData) return false

    // Add 5-minute buffer before expiry
    const bufferMs = 5 * 60 * 1000
    return Date.now() < (this.tokenData.expiresAt - bufferMs)
  }

  /**
   * Create a new token using app credentials
   */
  private async createNewToken(): Promise<TokenData> {
    const appKey = process.env.EZTEXTING_APP_KEY
    const appSecret = process.env.EZTEXTING_APP_SECRET

    if (!appKey || !appSecret) {
      throw new Error('EZ Texting app credentials not configured')
    }

    const response = await fetch('https://a.eztexting.com/v1/tokens/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        appKey,
        appSecret
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to create token: ${response.status} - ${errorText}`)
    }

    const tokenResponse: TokenResponse = await response.json()

    const expiresAt = Date.now() + (tokenResponse.expiresInSeconds * 1000)

    const tokenData: TokenData = {
      accessToken: tokenResponse.accessToken,
      refreshToken: tokenResponse.refreshToken,
      expiresAt
    }

    this.tokenData = tokenData
    return tokenData
  }

  /**
   * Refresh the current token using refresh token
   */
  private async refreshToken(): Promise<TokenData> {
    if (!this.tokenData?.refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await fetch('https://a.eztexting.com/v1/tokens/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refreshToken: this.tokenData.refreshToken
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to refresh token: ${response.status} - ${errorText}`)
    }

    const tokenResponse: TokenResponse = await response.json()

    const expiresAt = Date.now() + (tokenResponse.expiresInSeconds * 1000)

    const tokenData: TokenData = {
      accessToken: tokenResponse.accessToken,
      refreshToken: tokenResponse.refreshToken,
      expiresAt
    }

    this.tokenData = tokenData
    return tokenData
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  async getValidAccessToken(): Promise<string> {
    // Initialize from environment if not already done
    if (!this.tokenData) {
      this.initializeFromEnv()
    }

    // If we have a valid token, return it
    if (this.isTokenValid()) {
      return this.tokenData!.accessToken
    }

    try {
      // Try to refresh the token first
      if (this.tokenData?.refreshToken) {
        await this.refreshToken()
        return this.tokenData!.accessToken
      }
    } catch (refreshError) {
      console.warn('Token refresh failed, creating new token:', refreshError)
    }

    // If refresh fails or no refresh token, create new token
    await this.createNewToken()
    return this.tokenData!.accessToken
  }

  /**
   * Revoke current tokens (optional cleanup)
   */
  async revokeTokens(): Promise<void> {
    if (!this.tokenData?.refreshToken) {
      return
    }

    try {
      await fetch('https://a.eztexting.com/v1/tokens/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: this.tokenData.refreshToken,
          type: 'REFRESH_TOKEN'
        })
      })
    } catch (error) {
      console.warn('Failed to revoke tokens:', error)
    }

    this.tokenData = null
  }

  /**
   * Get current token info (for debugging)
   */
  getTokenInfo(): { hasToken: boolean; expiresAt?: Date; isValid?: boolean } {
    if (!this.tokenData) {
      return { hasToken: false }
    }

    return {
      hasToken: true,
      expiresAt: new Date(this.tokenData.expiresAt),
      isValid: this.isTokenValid()
    }
  }
}

export const ezTextingAuth = EZTextingAuth.getInstance()
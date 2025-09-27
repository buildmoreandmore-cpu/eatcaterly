'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Settings,
  Save,
  Eye,
  EyeOff,
  Key,
  Phone,
  CreditCard,
  Globe,
  Shield,
  Bell,
  Database,
  TestTube,
  AlertTriangle,
  CheckCircle,
  Copy,
  ExternalLink
} from 'lucide-react'

interface SettingsData {
  // Twilio Settings
  twilioAccountSid: string
  twilioAuthToken: string
  twilioPhoneNumber: string

  // Stripe Settings
  stripeSecretKey: string
  stripePublishableKey: string
  stripeWebhookSecret: string

  // Application Settings
  appUrl: string
  appName: string

  // Database
  databaseUrl: string

  // Notifications
  emailNotifications: boolean
  smsNotifications: boolean
  webhookNotifications: boolean
}

const defaultSettings: SettingsData = {
  twilioAccountSid: '',
  twilioAuthToken: '',
  twilioPhoneNumber: '',
  stripeSecretKey: '',
  stripePublishableKey: '',
  stripeWebhookSecret: '',
  appUrl: 'https://your-app.vercel.app',
  appName: 'SMS Food Delivery',
  databaseUrl: '',
  emailNotifications: true,
  smsNotifications: true,
  webhookNotifications: false
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [isDemoMode, setIsDemoMode] = useState(true)

  useEffect(() => {
    loadSettings()
    checkDemoMode()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings({ ...defaultSettings, ...data })
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
      // Use default settings in demo mode
    } finally {
      setLoading(false)
    }
  }

  const checkDemoMode = () => {
    // In demo mode, we'll show environment variable status
    const hasTwilio = Boolean(process.env.NEXT_PUBLIC_HAS_TWILIO)
    const hasStripe = Boolean(process.env.NEXT_PUBLIC_HAS_STRIPE)
    setIsDemoMode(!hasTwilio || !hasStripe)
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        alert('Settings saved successfully! Note: Some changes may require redeployment.')
      } else {
        alert('Failed to save settings. In demo mode, settings are not persisted.')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Settings saved locally (demo mode)')
    } finally {
      setSaving(false)
    }
  }

  const toggleSecret = (field: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const maskSecret = (value: string) => {
    if (!value) return ''
    return value.replace(/./g, '•').substring(0, Math.min(value.length, 20))
  }

  const updateSetting = (key: keyof SettingsData, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            System Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure your API keys, webhooks, and application settings
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
          <Button
            onClick={saveSettings}
            disabled={saving}
            className="inline-flex items-center"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Demo Mode Warning */}
      {isDemoMode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Demo Mode Active</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Add your API keys below and redeploy to enable full functionality.
                Settings in demo mode are for reference only.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Twilio Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-4">
            <Phone className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Twilio SMS Configuration</h3>
            {settings.twilioAccountSid ? (
              <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600 ml-2" />
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account SID *
              </label>
              <div className="relative">
                <Input
                  type={showSecrets.twilioAccountSid ? 'text' : 'password'}
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={showSecrets.twilioAccountSid ? settings.twilioAccountSid : maskSecret(settings.twilioAccountSid)}
                  onChange={(e) => updateSetting('twilioAccountSid', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('twilioAccountSid')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showSecrets.twilioAccountSid ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auth Token *
              </label>
              <div className="relative">
                <Input
                  type={showSecrets.twilioAuthToken ? 'text' : 'password'}
                  placeholder="Your Twilio Auth Token"
                  value={showSecrets.twilioAuthToken ? settings.twilioAuthToken : maskSecret(settings.twilioAuthToken)}
                  onChange={(e) => updateSetting('twilioAuthToken', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('twilioAuthToken')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showSecrets.twilioAuthToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <Input
                type="tel"
                placeholder="+1234567890"
                value={settings.twilioPhoneNumber}
                onChange={(e) => updateSetting('twilioPhoneNumber', e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p>Get your Twilio credentials from your <a href="https://console.twilio.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">
              Twilio Console <ExternalLink className="h-3 w-3 ml-1" />
            </a></p>
          </div>
        </div>
      </div>

      {/* Stripe Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-4">
            <CreditCard className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Stripe Payment Configuration</h3>
            {settings.stripeSecretKey ? (
              <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600 ml-2" />
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secret Key *
              </label>
              <div className="relative">
                <Input
                  type={showSecrets.stripeSecretKey ? 'text' : 'password'}
                  placeholder="sk_test_..."
                  value={showSecrets.stripeSecretKey ? settings.stripeSecretKey : maskSecret(settings.stripeSecretKey)}
                  onChange={(e) => updateSetting('stripeSecretKey', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('stripeSecretKey')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showSecrets.stripeSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publishable Key *
              </label>
              <Input
                type="text"
                placeholder="pk_test_..."
                value={settings.stripePublishableKey}
                onChange={(e) => updateSetting('stripePublishableKey', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook Secret
              </label>
              <div className="relative">
                <Input
                  type={showSecrets.stripeWebhookSecret ? 'text' : 'password'}
                  placeholder="whsec_..."
                  value={showSecrets.stripeWebhookSecret ? settings.stripeWebhookSecret : maskSecret(settings.stripeWebhookSecret)}
                  onChange={(e) => updateSetting('stripeWebhookSecret', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('stripeWebhookSecret')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showSecrets.stripeWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p>Get your Stripe keys from your <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">
              Stripe Dashboard <ExternalLink className="h-3 w-3 ml-1" />
            </a></p>
          </div>
        </div>
      </div>

      {/* Application Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-4">
            <Globe className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Application Configuration</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application Name
              </label>
              <Input
                type="text"
                placeholder="SMS Food Delivery"
                value={settings.appName}
                onChange={(e) => updateSetting('appName', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application URL *
              </label>
              <div className="flex">
                <Input
                  type="url"
                  placeholder="https://your-app.vercel.app"
                  value={settings.appUrl}
                  onChange={(e) => updateSetting('appUrl', e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(settings.appUrl)}
                  className="ml-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Webhook URLs */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-4">
            <Shield className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Webhook Endpoints</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twilio SMS Webhook
              </label>
              <div className="flex">
                <Input
                  type="text"
                  readOnly
                  value={`${settings.appUrl}/api/webhooks/sms`}
                  className="bg-gray-50"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(`${settings.appUrl}/api/webhooks/sms`)}
                  className="ml-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Configure this in your Twilio phone number settings
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stripe Payment Webhook
              </label>
              <div className="flex">
                <Input
                  type="text"
                  readOnly
                  value={`${settings.appUrl}/api/webhooks/stripe`}
                  className="bg-gray-50"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(`${settings.appUrl}/api/webhooks/stripe`)}
                  className="ml-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Configure this in your Stripe webhook settings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Database Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-4">
            <Database className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Database Configuration</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Database URL *
            </label>
            <div className="relative">
              <Input
                type={showSecrets.databaseUrl ? 'text' : 'password'}
                placeholder="postgresql://username:password@host:port/database"
                value={showSecrets.databaseUrl ? settings.databaseUrl : maskSecret(settings.databaseUrl)}
                onChange={(e) => updateSetting('databaseUrl', e.target.value)}
              />
              <button
                type="button"
                onClick={() => toggleSecret('databaseUrl')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showSecrets.databaseUrl ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              PostgreSQL connection string for your database
            </p>
          </div>
        </div>
      </div>

      {/* Testing Tools */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-4">
            <TestTube className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Testing & Development</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Test SMS Connection</div>
                <div className="text-sm text-gray-500">Send a test message to verify Twilio setup</div>
              </div>
            </Button>

            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Test Payment Link</div>
                <div className="text-sm text-gray-500">Create a test payment to verify Stripe setup</div>
              </div>
            </Button>

            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">View Logs</div>
                <div className="text-sm text-gray-500">Check application logs and errors</div>
              </div>
            </Button>

            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Database Status</div>
                <div className="text-sm text-gray-500">Test database connection and migrations</div>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Environment Variables Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Key className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Environment Variables</h3>
            <div className="text-sm text-blue-700 mt-2 space-y-1">
              <p>To enable full functionality, add these environment variables to your Vercel deployment:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><code>DATABASE_URL</code> - PostgreSQL connection string</li>
                <li><code>TWILIO_ACCOUNT_SID</code> - Your Twilio Account SID</li>
                <li><code>TWILIO_AUTH_TOKEN</code> - Your Twilio Auth Token</li>
                <li><code>TWILIO_PHONE_NUMBER</code> - Your Twilio phone number</li>
                <li><code>STRIPE_SECRET_KEY</code> - Your Stripe secret key</li>
                <li><code>STRIPE_WEBHOOK_SECRET</code> - Your Stripe webhook secret</li>
                <li><code>APP_URL</code> - Your application URL</li>
                <li><code>NEXTAUTH_SECRET</code> - Random secret for auth</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'
import { ArrowLeft } from 'lucide-react'
import { PageLoading } from '@/components/ui/loading'

export default function SettingsPage() {
  const { isAuthenticated, isLoading, hasApiKey } = useAuth()
  const router = useRouter()
  const [apiKey, setApiKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadProfile()
  }, [isAuthenticated, isLoading, router])

  const loadProfile = async () => {
    try {
      const data = await api.getUserProfile()
      if (data.hasApiKey) {
        setApiKey('••••••••••••••••••••••••••••••')
      }
    } catch (err) {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      if (apiKey === '••••••••••••••••••••••••••••••') {
        setError('API key already saved')
        setSaving(false)
        return
      }

      await api.updateApiKey(apiKey || null)
      setSuccess('API key saved successfully!')
      setApiKey('••••••••••••••••••••••••••••••')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save API key')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async () => {
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      await api.updateApiKey(null)
      setApiKey('')
      setSuccess('API key removed. Using default key.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove API key')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PageLoading text="Loading settings..." />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 px-4 py-3 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.push('/calendar')}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Calendar
          </button>
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 text-green-600 p-3 rounded-lg text-sm mb-4">
            {success}
          </div>
        )}

        <div className="max-w-2xl">
          <div className="rounded-lg border p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">OpenRouter API Key</h2>
              <p className="text-sm text-muted-foreground mb-4">
                By default, the app uses a shared API key. You can add your own OpenRouter API key to avoid rate limits.
                Get your free API key at{' '}
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline"
                >
                  openrouter.ai/keys
                </a>
              </p>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">API Key</label>
              <Input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="font-mono rounded-lg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your API key is stored securely and only used for AI requests.
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} className="rounded-lg">
                {saving ? 'Saving...' : 'Save API Key'}
              </Button>
              {hasApiKey && (
                <Button variant="outline" onClick={handleRemove} disabled={saving} className="rounded-lg">
                  Remove Key
                </Button>
              )}
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                <strong>Status:</strong>{' '}
                {hasApiKey ? (
                  <span className="text-green-600">Using your personal API key</span>
                ) : (
                  <span>Using default shared key (may have rate limits)</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

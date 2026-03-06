'use client'

import { useState } from 'react'
import { useTranslation } from '@/i18n'

interface FooterNewsletterSignupProps {
  onSuccess?: () => void
}

export function FooterNewsletterSignup({ onSuccess }: FooterNewsletterSignupProps) {
  const { t } = useTranslation()

  const [email, setEmail] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    if (!email.trim()) {
      setError(t('footer.emailRequired') || 'Email is required')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/emails/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || t('footer.subscriptionFailed') || 'Subscription failed')
        setLoading(false)
        return
      }

      setSuccessMessage(data.message || t('footer.subscribeSuccess'))
      setEmail('')
      onSuccess?.()

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
    } catch (err) {
      setError(t('footer.somethingWentWrong') || 'Something went wrong. Try again.')
      console.error('Newsletter signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">{t('footer.stayUpdated')}</h3>
        <p className="text-xs text-white/60 mt-1">{t('footer.stayUpdatedDesc') || 'Get updates on new cases and verdicts'}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('footer.enterEmail')}
          disabled={loading}
          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '...' : t('footer.subscribe')}
        </button>
      </form>

      {error && (
        <div className="mt-3 text-xs text-destructive">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mt-3 text-xs text-emerald-500">
          {successMessage}
        </div>
      )}
    </div>
  )
}

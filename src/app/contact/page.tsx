'use client'

import { useState } from 'react'
import { PaperAirplaneIcon, ShieldCheckIcon, EnvelopeIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n'

export default function ContactPage() {
    const { t } = useTranslation()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'general',
        message: '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        alert(t('contact.messageSent'))
    }

    const badges = [
        { icon: ShieldCheckIcon, label: t('contact.secure'), desc: t('contact.secureDesc') },
        { icon: EnvelopeIcon, label: t('contact.responsive'), desc: t('contact.responsiveDesc') },
        { icon: ChatBubbleLeftRightIcon, label: t('contact.confidential'), desc: t('contact.confidentialDesc') },
    ]

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-3">
                <h1 className="text-3xl font-bold tracking-tight">{t('contact.title')}</h1>
                <p className="text-muted-foreground">
                    {t('contact.subtitle')}
                </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
                {badges.map((item) => (
                    <div key={item.label} className="rounded-xl border bg-card p-4 text-center">
                        <item.icon className="h-6 w-6 mx-auto mb-2" style={{ color: 'hsl(var(--primary))' }} />
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                            {t('contact.yourName')}
                        </label>
                        <Input
                            id="name"
                            placeholder={t('contact.yourName')}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                            {t('contact.emailAddress')}
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                        {t('contact.subject')}
                    </label>
                    <select
                        id="subject"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    >
                        <option value="general">{t('contact.subjectGeneral')}</option>
                        <option value="evidence">{t('contact.subjectEvidence')}</option>
                        <option value="legal">{t('contact.subjectLegal')}</option>
                        <option value="media">{t('contact.subjectMedia')}</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                        {t('contact.messageLabel')}
                    </label>
                    <textarea
                        id="message"
                        rows={5}
                        placeholder={t('contact.messagePlaceholder')}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                    />
                </div>

                <Button type="submit" className="w-full gap-2">
                    <PaperAirplaneIcon className="h-4 w-4" />
                    {t('contact.sendMessage')}
                </Button>
            </form>
        </div>
    )
}

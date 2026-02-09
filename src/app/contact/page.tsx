'use client'

import { useState } from 'react'
import { Send, Shield, Mail, MessageSquare } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'general',
        message: '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: Wire to Supabase or email service
        alert('Message sent! We will respond within 48 hours.')
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-3">
                <h1 className="text-3xl font-bold tracking-tight">Contact Us</h1>
                <p className="text-muted-foreground">
                    Secure communication channels for victims, journalists, and partners.
                </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
                {[
                    { icon: Shield, label: 'Secure', desc: 'All communications are encrypted' },
                    { icon: Mail, label: 'Responsive', desc: 'We respond within 48 hours' },
                    { icon: MessageSquare, label: 'Confidential', desc: 'Your identity is protected' },
                ].map((item) => (
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
                            Your Name
                        </label>
                        <Input
                            id="name"
                            placeholder="Full name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                            Email Address
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
                        Subject
                    </label>
                    <select
                        id="subject"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    >
                        <option value="general">General Inquiry</option>
                        <option value="evidence">Submit Evidence</option>
                        <option value="legal">Legal</option>
                        <option value="media">Media / Press</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                        Message
                    </label>
                    <textarea
                        id="message"
                        rows={5}
                        placeholder="How can we help?"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                    />
                </div>

                <Button type="submit" className="w-full gap-2">
                    <Send className="h-4 w-4" />
                    Send Message
                </Button>
            </form>
        </div>
    )
}

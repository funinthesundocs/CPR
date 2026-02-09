'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserIcon } from '@heroicons/react/24/outline'
import type { User as SupaUser } from '@supabase/supabase-js'

export default function ProfilePage() {
    const [user, setUser] = useState<SupaUser | null>(null)
    const [displayName, setDisplayName] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('display_name')
                    .eq('id', user.id)
                    .single()

                if (profile?.display_name) {
                    setDisplayName(profile.display_name)
                }
            }
            setLoading(false)
        }
        getUser()
    }, [supabase])

    const handleSave = async () => {
        if (!user) return
        setSaving(true)

        await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                display_name: displayName,
                updated_at: new Date().toISOString()
            })

        setSaving(false)
        alert('Profile saved!')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-muted-foreground">Please sign in to view your profile.</p>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <UserIcon className="h-7 w-7" style={{ color: 'hsl(var(--primary))' }} />
                    Profile
                </h1>
                <p className="text-muted-foreground mt-1">
                    Manage your account settings
                </p>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                        value={user.email || ''}
                        disabled
                        className="bg-muted"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Display Name</label>
                    <Input
                        placeholder="Enter your display name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                    />
                </div>

                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-primary text-primary-foreground"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div>
    )
}

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import type { User } from '@supabase/supabase-js'

type Profile = {
    id: string
    display_name: string
    tagline: string | null
    avatar_url: string | null
    cover_photo_url: string | null
    bio: string
    language: string
    is_verified: boolean
    profile_completion: number
    trust_score: number
    follower_count: number
    following_count: number
    case_count: number
    email: string | null
    joined_at: string
    last_active_at: string
}

export default function ProfilePage() {
    const router = useRouter()
    const supabase = createClient()
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editing, setEditing] = useState(false)
    const [success, setSuccess] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [cases, setCases] = useState<any[]>([])
    const [posts, setPosts] = useState<any[]>([])

    // Editable fields
    const [editName, setEditName] = useState('')
    const [editTagline, setEditTagline] = useState('')
    const [editBio, setEditBio] = useState('')
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

    const loadProfile = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }
        setUser(user)

        const { data: profileData } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profileData) {
            setProfile(profileData as Profile)
            setEditName(profileData.display_name || '')
            setEditTagline(profileData.tagline || '')
            setEditBio(profileData.bio || '')
        }

        // Load user's cases
        const { data: userCases } = await supabase
            .from('cases')
            .select('id, case_number, status, case_types, created_at, defendants(full_name, slug)')
            .eq('plaintiff_id', user.id)
            .order('created_at', { ascending: false })

        setCases(userCases || [])

        // Load user's posts
        const { data: userPosts } = await supabase
            .from('posts')
            .select('id, title, content, created_at, upvote_count, downvote_count')
            .eq('author_id', user.id)
            .order('created_at', { ascending: false })

        setPosts(userPosts || [])
        setLoading(false)
    }, [supabase, router])

    useEffect(() => { loadProfile() }, [loadProfile])

    const handleSave = async () => {
        if (!user || !profile) return
        setSaving(true)
        setError(null)
        setSuccess(null)

        try {
            let avatarUrl = profile.avatar_url

            // Upload new avatar
            if (avatarFile) {
                const ext = avatarFile.name.split('.').pop()
                const path = `${user.id}/avatar.${ext}`
                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(path, avatarFile, { upsert: true })

                if (!uploadError) {
                    const { data: publicUrl } = supabase.storage
                        .from('avatars')
                        .getPublicUrl(path)
                    avatarUrl = publicUrl.publicUrl
                }
            }

            // Calculate profile completion
            let completion = 0
            if (editName.trim()) completion += 20
            if (editBio.trim()) completion += 20
            if (editTagline?.trim()) completion += 10
            if (avatarUrl) completion += 20
            if (profile.is_verified) completion += 30

            const { error: updateError } = await supabase
                .from('user_profiles')
                .update({
                    display_name: editName.trim(),
                    tagline: editTagline.trim() || null,
                    bio: editBio.trim(),
                    avatar_url: avatarUrl,
                    profile_completion: completion,
                })
                .eq('id', user.id)

            if (updateError) throw new Error(updateError.message)

            setEditing(false)
            setAvatarFile(null)
            setAvatarPreview(null)
            setSuccess('Profile updated!')
            await loadProfile()
        } catch (err: any) {
            setError(err.message || 'Failed to save')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        )
    }

    if (!user || !profile) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-muted-foreground">Please sign in to view your profile.</p>
            </div>
        )
    }

    const statusColors: Record<string, string> = {
        draft: 'bg-muted text-muted-foreground',
        pending_convergence: 'bg-yellow-500/10 text-yellow-600',
        admin_review: 'bg-blue-500/10 text-blue-600',
        investigation: 'bg-purple-500/10 text-purple-600',
        judgment: 'bg-orange-500/10 text-orange-600',
        verdict_guilty: 'bg-red-500/10 text-red-700',
        verdict_innocent: 'bg-green-500/10 text-green-600',
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Profile Header */}
            <div className="relative rounded-2xl border overflow-hidden">
                {/* Cover photo */}
                <div className="h-32 sm:h-40 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5" />

                <div className="px-6 pb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10 sm:-mt-12">
                        {/* Avatar */}
                        <div className="relative">
                            {(avatarPreview || profile.avatar_url) ? (
                                <img
                                    src={avatarPreview || profile.avatar_url!}
                                    alt={profile.display_name}
                                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover ring-4 ring-background shadow-lg"
                                />
                            ) : (
                                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground ring-4 ring-background shadow-lg">
                                    {profile.display_name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                            )}
                            {profile.is_verified && (
                                <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-0.5">
                                    <span className="text-xs">✓</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl sm:text-2xl font-bold">{profile.display_name}</h1>
                                {profile.is_verified && <Badge className="bg-blue-500/10 text-blue-600 text-xs">Verified</Badge>}
                            </div>
                            {profile.tagline && <p className="text-sm text-muted-foreground">{profile.tagline}</p>}
                            <p className="text-xs text-muted-foreground mt-1">
                                Joined {new Date(profile.joined_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>

                        <Button
                            variant={editing ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => editing ? handleSave() : setEditing(true)}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Edit Profile'}
                        </Button>
                    </div>
                </div>
            </div>

            {success && (
                <div className="rounded-lg border border-green-500/50 bg-green-500/5 p-3">
                    <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
                </div>
            )}
            {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3">
                    <p className="text-sm text-destructive">{error}</p>
                </div>
            )}

            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <StatCard label="Trust Score" value={`${profile.trust_score}/100`} />
                <StatCard label="Cases Filed" value={profile.case_count.toString()} />
                <StatCard label="Followers" value={profile.follower_count.toString()} />
                <StatCard label="Following" value={profile.following_count.toString()} />
                <StatCard label="Profile" value={`${profile.profile_completion}%`} extra={
                    <Progress value={profile.profile_completion} className="h-1 mt-1" />
                } />
            </div>

            {/* Editing Form */}
            {editing && (
                <Card>
                    <CardHeader><CardTitle className="text-lg">Edit Profile</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Display Name *</Label>
                            <Input value={editName} onChange={e => setEditName(e.target.value)} maxLength={50} />
                        </div>
                        <div className="space-y-2">
                            <Label>Tagline</Label>
                            <Input value={editTagline} onChange={e => setEditTagline(e.target.value)} placeholder="A short line about you" maxLength={100} />
                        </div>
                        <div className="space-y-2">
                            <Label>Bio *</Label>
                            <Textarea value={editBio} onChange={e => setEditBio(e.target.value)} rows={4} maxLength={500} />
                            <p className="text-xs text-muted-foreground">{editBio.length}/500</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Avatar</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={e => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                        setAvatarFile(file)
                                        setAvatarPreview(URL.createObjectURL(file))
                                    }
                                }}
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => { setEditing(false); setAvatarFile(null); setAvatarPreview(null) }}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Bio */}
            {!editing && profile.bio && (
                <Card>
                    <CardContent className="p-5">
                        <p className="text-sm whitespace-pre-wrap">{profile.bio}</p>
                    </CardContent>
                </Card>
            )}

            <Separator />

            {/* Tabs: Cases & Posts */}
            <Tabs defaultValue="cases" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="cases">My Cases ({cases.length})</TabsTrigger>
                    <TabsTrigger value="posts">My Posts ({posts.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="cases" className="space-y-3">
                    {cases.length === 0 ? (
                        <EmptyCard message="No cases filed yet" cta="File a Case" href="/cases/new" />
                    ) : (
                        cases.map((c: any) => (
                            <Card key={c.id} className="hover:shadow-sm transition-shadow cursor-pointer"
                                onClick={() => router.push(`/cases/${c.case_number}`)}>
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono text-sm font-bold">{c.case_number}</span>
                                            <Badge variant="outline" className={`text-xs capitalize ${statusColors[c.status] || ''}`}>
                                                {c.status.replace(/_/g, ' ')}
                                            </Badge>
                                        </div>
                                        <p className="text-sm">vs. {c.defendants?.full_name || 'Unknown'}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(c.created_at).toLocaleDateString()}
                                    </p>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                <TabsContent value="posts" className="space-y-3">
                    {posts.length === 0 ? (
                        <EmptyCard message="No posts yet" />
                    ) : (
                        posts.map((post: any) => (
                            <Card key={post.id}>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-sm">{post.title}</h3>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{post.content}</p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                        <span>👍 {post.upvote_count || 0}</span>
                                        <span>👎 {post.downvote_count || 0}</span>
                                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>
            </Tabs>

            {/* Account Info */}
            <Card>
                <CardHeader><CardTitle className="text-base">Account</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Email</span>
                        <span>{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Language</span>
                        <span className="uppercase">{profile.language || 'en'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Active</span>
                        <span>{new Date(profile.last_active_at).toLocaleDateString()}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function StatCard({ label, value, extra }: { label: string; value: string; extra?: React.ReactNode }) {
    return (
        <div className="rounded-xl border bg-card p-3 text-center">
            <p className="text-lg font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
            {extra}
        </div>
    )
}

function EmptyCard({ message, cta, href }: { message: string; cta?: string; href?: string }) {
    return (
        <div className="rounded-xl border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">{message}</p>
            {cta && href && (
                <a href={href}>
                    <Button variant="outline" size="sm" className="mt-3">{cta}</Button>
                </a>
            )}
        </div>
    )
}

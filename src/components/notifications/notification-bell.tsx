'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BellIcon } from '@heroicons/react/24/outline'
import type { User } from '@supabase/supabase-js'

type Notification = {
    id: string
    type: string
    title: string
    body: string
    action_url: string | null
    read_at: string | null
    created_at: string
}

export function NotificationBell() {
    const router = useRouter()
    const supabase = createClient()
    const [user, setUser] = useState<User | null>(null)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const loadNotifications = useCallback(async (userId: string) => {
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20)

        const notifs = (data || []) as Notification[]
        setNotifications(notifs)
        setUnreadCount(notifs.filter(n => !n.read_at).length)
    }, [supabase])

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            setUser(user)
            await loadNotifications(user.id)

            // Realtime subscription
            const channel = supabase
                .channel(`notifications:${user.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`,
                    },
                    () => { loadNotifications(user.id) }
                )
                .subscribe()

            return () => { supabase.removeChannel(channel) }
        }
        init()
    }, [supabase, loadNotifications])

    const markAsRead = async (notif: Notification) => {
        if (!notif.read_at) {
            await supabase
                .from('notifications')
                .update({ read_at: new Date().toISOString() })
                .eq('id', notif.id)
            setUnreadCount(prev => Math.max(0, prev - 1))
            setNotifications(prev =>
                prev.map(n => n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n)
            )
        }
        if (notif.action_url) {
            router.push(notif.action_url)
            setOpen(false)
        }
    }

    const markAllRead = async () => {
        if (!user) return
        await supabase
            .from('notifications')
            .update({ read_at: new Date().toISOString() })
            .eq('user_id', user.id)
            .is('read_at', null)
        setUnreadCount(0)
        setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })))
    }

    if (!user) return null

    const typeIcons: Record<string, string> = {
        case_update: '⚖️',
        vote_reminder: '🗳️',
        comment_reply: '💬',
        follow: '👤',
        verdict: '📜',
        convergence: '🔗',
        message: '✉️',
        achievement: '🏆',
        system: '🔔',
    }

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
                <BellIcon className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-[70vh] overflow-y-auto rounded-xl border bg-popover shadow-xl z-50">
                        <div className="sticky top-0 bg-popover border-b p-3 flex items-center justify-between">
                            <h3 className="text-sm font-semibold">Notifications</h3>
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {notifications.length === 0 ? (
                            <div className="p-6 text-center">
                                <p className="text-sm text-muted-foreground">No notifications yet</p>
                            </div>
                        ) : (
                            <div>
                                {notifications.map(notif => (
                                    <button
                                        key={notif.id}
                                        onClick={() => markAsRead(notif)}
                                        className={`w-full text-left p-3 border-b last:border-0 hover:bg-muted/50 transition-colors ${!notif.read_at ? 'bg-primary/5' : ''
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            <span className="text-lg shrink-0">{typeIcons[notif.type] || '🔔'}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-sm ${!notif.read_at ? 'font-semibold' : ''}`}>
                                                        {notif.title}
                                                    </p>
                                                    {!notif.read_at && (
                                                        <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notif.body}</p>
                                                <p className="text-xs text-muted-foreground/60 mt-1">{timeAgo(notif.created_at)}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

function timeAgo(dateStr: string): string {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return new Date(dateStr).toLocaleDateString()
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    ArrowRightOnRectangleIcon,
    ArrowLeftOnRectangleIcon,
    UserIcon
} from '@heroicons/react/24/outline'
import type { User as SupaUser } from '@supabase/supabase-js'

export function UserMenu() {
    const [user, setUser] = useState<SupaUser | null>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null)
            }
        )
        return () => subscription.unsubscribe()
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    if (!user) {
        return (
            <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => router.push('/login')}
            >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                <span className="text-sm">Sign In</span>
            </Button>
        )
    }

    const initials = user.email
        ? user.email.substring(0, 2).toUpperCase()
        : 'U'

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs" style={{ background: 'hsl(var(--primary))', color: 'white' }}>
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-sm truncate">{user.email}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                <DropdownMenuItem className="gap-2">
                    <UserIcon className="h-4 w-4" />
                    Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="gap-2 text-destructive">
                    <ArrowLeftOnRectangleIcon className="h-4 w-4" />
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

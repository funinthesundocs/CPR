'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarSeparator,
} from '@/components/ui/sidebar'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './theme-toggle'
import { ColorPicker } from './color-picker'
import { ZoomControl } from './zoom-control'
import { AdminSettingsPanel } from './admin-settings-panel'
import {
    Home,
    HelpCircle,
    FolderOpen,
    ChevronDown,
    UserCircle,
    PlusCircle,
    Settings,
    LogIn,
    LogOut,
    Scale,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'

const mainNavItems = [
    { title: 'Home', href: '/', icon: Home },
    { title: 'How It Works', href: '/how-it-works', icon: HelpCircle },
    { title: 'View Cases', href: '/cases', icon: FolderOpen },
]

const actionSubItems = [
    { title: 'My Profile', href: '/profile', icon: UserCircle },
    { title: 'Start New Case', href: '/cases/new', icon: PlusCircle },
]

export function AppSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [actionsOpen, setActionsOpen] = useState(false)
    const [settingsOpen, setSettingsOpen] = useState(false)

    useEffect(() => {
        const supabase = createClient()

        const loadUserState = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()
                setIsAdmin(profile?.role === 'admin')
            } else {
                setIsAdmin(false)
            }
        }

        loadUserState()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            loadUserState()
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleAuthAction = async () => {
        if (user) {
            const supabase = createClient()
            await supabase.auth.signOut()
            setUser(null)
            setIsAdmin(false)
            router.push('/')
            router.refresh()
        } else {
            router.push('/login')
        }
    }

    return (
        <>
            <Sidebar>
                <SidebarHeader className="p-4">
                    <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                        <Scale className="h-6 w-6" style={{ color: 'hsl(var(--primary))' }} />
                        <span className="leading-tight">Court of<br />Public Record</span>
                    </Link>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {/* Main nav items */}
                                {mainNavItems.map((item) => (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton asChild isActive={pathname === item.href}>
                                            <Link href={item.href}>
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}

                                {/* Actions accordion */}
                                <Collapsible
                                    open={actionsOpen}
                                    onOpenChange={setActionsOpen}
                                    className="group/collapsible"
                                >
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton>
                                                <ChevronDown
                                                    className={`h-4 w-4 transition-transform duration-200 ${actionsOpen ? 'rotate-180' : ''
                                                        }`}
                                                />
                                                <span>Actions</span>
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {actionSubItems.map((sub) => (
                                                    <SidebarMenuSubItem key={sub.href}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={pathname === sub.href}
                                                        >
                                                            <Link href={sub.href}>
                                                                <sub.icon className="h-3.5 w-3.5" />
                                                                <span>{sub.title}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter className="p-2 space-y-1">
                    <SidebarSeparator />

                    {/* Zoom control */}
                    <div className="flex items-center gap-2 px-2 py-1">
                        <span className="text-xs text-muted-foreground">Zoom</span>
                        <ZoomControl />
                    </div>

                    {/* Color picker */}
                    <ColorPicker />

                    {/* Theme toggle */}
                    <ThemeToggle />

                    <SidebarSeparator />

                    {/* Admin sprocket — only visible if admin */}
                    {isAdmin && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start gap-2"
                                onClick={() => setSettingsOpen(true)}
                            >
                                <Settings className="h-4 w-4" />
                                <span className="text-sm">Admin Settings</span>
                            </Button>
                            <SidebarSeparator />
                        </>
                    )}

                    {/* Sign In / Log Out */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2"
                        onClick={handleAuthAction}
                    >
                        {user ? (
                            <>
                                <LogOut className="h-4 w-4" />
                                <span className="text-sm">Log Out</span>
                            </>
                        ) : (
                            <>
                                <LogIn className="h-4 w-4" />
                                <span className="text-sm">Sign In</span>
                            </>
                        )}
                    </Button>
                </SidebarFooter>
            </Sidebar>

            {/* Admin settings slide-out panel */}
            <AdminSettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </>
    )
}

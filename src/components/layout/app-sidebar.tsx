'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { LanguageSwitcher } from '@/components/i18n/language-switcher'
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
    HomeIcon,
    QuestionMarkCircleIcon,
    FolderOpenIcon,
    ChevronDownIcon,
    UserCircleIcon,
    PlusCircleIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    ArrowLeftOnRectangleIcon,
    ScaleIcon,
    BuildingOfficeIcon,
    PaintBrushIcon,
    ChartBarIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline'
import type { User } from '@supabase/supabase-js'

const mainNavItems = [
    { title: 'Home', href: '/', icon: HomeIcon },
    { title: 'How It Works', href: '/how-it-works', icon: QuestionMarkCircleIcon },
    { title: 'Browse Cases', href: '/cases', icon: FolderOpenIcon },
    { title: 'Defendants', href: '/defendants', icon: UserGroupIcon },
]

const userNavItems = [
    { title: 'Profile', href: '/profile', icon: UserCircleIcon },
    { title: 'File a Case', href: '/cases/new', icon: PlusCircleIcon },
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
                // Check admin status via user_roles table
                const { data: userRoles } = await supabase
                    .from('user_roles')
                    .select('role_id, roles(name)')
                    .eq('user_id', user.id)
                const hasAdminRole = (userRoles || []).some(
                    (ur: any) => ur.roles?.name === 'admin' || ur.roles?.name === 'super_admin'
                )
                setIsAdmin(hasAdminRole)
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
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                            <ScaleIcon className="h-6 w-6" style={{ color: 'hsl(var(--primary))' }} />
                            <span className="leading-tight">Court of<br />Public Record</span>
                        </Link>
                        <NotificationBell />
                    </div>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {/* Conditionally render admin or public nav based on current path */}
                                {pathname?.startsWith('/admin') ? (
                                    <>
                                        {/* Admin nav items */}
                                        <SidebarMenuItem>
                                            <SidebarMenuButton asChild isActive={pathname === '/admin/organization'}>
                                                <Link href="/admin/organization">
                                                    <BuildingOfficeIcon className="h-4 w-4" />
                                                    <span>Organization Profile</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton asChild isActive={pathname === '/admin/activity'}>
                                                <Link href="/admin/activity">
                                                    <ChartBarIcon className="h-4 w-4" />
                                                    <span>Activity Log</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>

                                        {/* Users accordion */}
                                        <Collapsible
                                            open={pathname?.startsWith('/admin/users')}
                                            className="group/collapsible"
                                        >
                                            <SidebarMenuItem>
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuButton>
                                                        <UserCircleIcon className="h-4 w-4" />
                                                        <span>Users</span>
                                                        <ChevronDownIcon
                                                            className={`h-4 w-4 ml-auto transition-transform duration-200 ${pathname?.startsWith('/admin/users') ? 'rotate-180' : ''
                                                                }`}
                                                        />
                                                    </SidebarMenuButton>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <SidebarMenuSub>
                                                        <SidebarMenuSubItem>
                                                            <SidebarMenuSubButton
                                                                asChild
                                                                isActive={pathname === '/admin/users'}
                                                            >
                                                                <Link href="/admin/users">
                                                                    <span>All Users</span>
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                        <SidebarMenuSubItem>
                                                            <SidebarMenuSubButton
                                                                asChild
                                                                isActive={pathname === '/admin/users/roles'}
                                                            >
                                                                <Link href="/admin/users/roles">
                                                                    <span>Permissions & Roles</span>
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                        <SidebarMenuSubItem>
                                                            <SidebarMenuSubButton
                                                                asChild
                                                                isActive={pathname === '/admin/users/invitations'}
                                                            >
                                                                <Link href="/admin/users/invitations">
                                                                    <span>Invitations</span>
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </SidebarMenuItem>
                                        </Collapsible>
                                    </>
                                ) : (
                                    <>
                                        {/* Public nav items */}
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
                                                        <ChevronDownIcon
                                                            className={`h-4 w-4 transition-transform duration-200 ${actionsOpen ? 'rotate-180' : ''
                                                                }`}
                                                        />
                                                        <span>Actions</span>
                                                    </SidebarMenuButton>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <SidebarMenuSub>
                                                        {userNavItems.map((sub) => (
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
                                    </>
                                )}
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

                    {/* Admin button — changes based on context */}
                    {isAdmin && (
                        <>
                            {pathname.startsWith('/admin') ? (
                                <Link href="/">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start gap-2"
                                    >
                                        <HomeIcon className="h-4 w-4" />
                                        <span className="text-sm">Visit Site</span>
                                    </Button>
                                </Link>
                            ) : (
                                <Link href="/admin">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start gap-2"
                                    >
                                        <Cog6ToothIcon className="h-4 w-4" />
                                        <span className="text-sm">Admin Settings</span>
                                    </Button>
                                </Link>
                            )}
                            <SidebarSeparator />
                        </>
                    )}

                    {/* Language Switcher */}
                    <LanguageSwitcher />
                    <SidebarSeparator />

                    {/* Sign In / Log Out */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2"
                        onClick={handleAuthAction}
                    >
                        {user ? (
                            <>
                                <ArrowLeftOnRectangleIcon className="h-4 w-4" />
                                <span className="text-sm">Log Out</span>
                            </>
                        ) : (
                            <>
                                <ArrowRightOnRectangleIcon className="h-4 w-4" />
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

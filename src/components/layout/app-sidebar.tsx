'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/i18n'
import { usePermissions } from '@/hooks/usePermissions'
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
    HandThumbUpIcon,
    FlagIcon,
} from '@heroicons/react/24/outline'
import type { User } from '@supabase/supabase-js'

// Nav items are defined inside the component so they can use t() for translations

export function AppSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const { t } = useTranslation()

    const mainNavItems = [
        { title: t('common.home'), href: '/', icon: HomeIcon },
        { title: t('nav.howItWorks'), href: '/how-it-works', icon: QuestionMarkCircleIcon },
        { title: t('nav.browseCases'), href: '/cases', icon: FolderOpenIcon },
        { title: t('common.defendants'), href: '/defendants', icon: UserGroupIcon },
    ]

    const userNavItems = [
        { title: t('common.profile'), href: '/profile', icon: UserCircleIcon },
        { title: t('nav.fileCase'), href: '/cases/new', icon: PlusCircleIcon },
    ]
    const [user, setUser] = useState<User | null>(null)
    const [actionsOpen, setActionsOpen] = useState(false)
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [usersOpen, setUsersOpen] = useState(false)
    const { hasPermission, isAdmin, loading: permissionsLoading } = usePermissions()

    useEffect(() => {
        const supabase = createClient()

        const loadUserState = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
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
                                        {/* Admin nav items — gated by permissions */}
                                        {hasPermission('manage_cases') && (
                                            <SidebarMenuItem>
                                                <SidebarMenuButton asChild isActive={pathname === '/admin/cases'}>
                                                    <Link href="/admin/cases">
                                                        <FolderOpenIcon className="h-4 w-4" />
                                                        <span>Cases</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        )}
                                        {hasPermission('manage_cases') && (
                                            <SidebarMenuItem>
                                                <SidebarMenuButton asChild isActive={pathname === '/admin/defendants'}>
                                                    <Link href="/admin/defendants">
                                                        <UserGroupIcon className="h-4 w-4" />
                                                        <span>Defendants</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        )}
                                        {hasPermission('moderate_content') && (
                                            <SidebarMenuItem>
                                                <SidebarMenuButton asChild isActive={pathname === '/admin/votes'}>
                                                    <Link href="/admin/votes">
                                                        <HandThumbUpIcon className="h-4 w-4" />
                                                        <span>Votes & Moderation</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        )}
                                        {hasPermission('moderate_content') && (
                                            <SidebarMenuItem>
                                                <SidebarMenuButton asChild isActive={pathname === '/admin/reports'}>
                                                    <Link href="/admin/reports">
                                                        <FlagIcon className="h-4 w-4" />
                                                        <span>Reports & Flags</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        )}

                                        <SidebarSeparator className="my-2" />

                                        {hasPermission('manage_permissions') && (
                                            <SidebarMenuItem>
                                                <SidebarMenuButton asChild isActive={pathname === '/admin/site-management'}>
                                                    <Link href="/admin/site-management">
                                                        <BuildingOfficeIcon className="h-4 w-4" />
                                                        <span>Site Management</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        )}
                                        {hasPermission('access_admin_dashboard') && (
                                            <SidebarMenuItem>
                                                <SidebarMenuButton asChild isActive={pathname === '/admin/activity'}>
                                                    <Link href="/admin/activity">
                                                        <ChartBarIcon className="h-4 w-4" />
                                                        <span>Activity Log</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        )}

                                        {/* Users accordion — gated by manage_users */}
                                        {hasPermission('manage_users') && (
                                            <Collapsible
                                                open={usersOpen || pathname?.startsWith('/admin/users')}
                                                onOpenChange={setUsersOpen}
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
                                                            {hasPermission('manage_roles') && (
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
                                                            )}
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
                                        )}
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
                                                        <span>{t('nav.actions')}</span>
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
                        <span className="text-xs text-muted-foreground">{t('nav.zoomLevel')}</span>
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

                    {/* Language Switcher — hidden on admin pages */}
                    {!pathname.startsWith('/admin') && (
                        <>
                            <LanguageSwitcher />
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
                                <ArrowLeftOnRectangleIcon className="h-4 w-4" />
                                <span className="text-sm">{t('nav.signOut')}</span>
                            </>
                        ) : (
                            <>
                                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                                <span className="text-sm">{t('nav.signIn')}</span>
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

'use client'

import { useState } from 'react'
import { X, Building2, Users, Palette, Activity, Moon, ChevronDown } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface AdminSettingsPanelProps {
    open: boolean
    onClose: () => void
}

const adminNavItems = [
    { title: 'Organization Profile', icon: Building2, href: '/admin/organization' },
    { title: 'Style Manager', icon: Palette, href: '/admin/styles' },
    { title: 'Activity Log', icon: Activity, href: '/admin/activity' },
]

const userSubItems = [
    { title: 'All Users', href: '/admin/users' },
    { title: 'Roles & Permissions', href: '/admin/users/roles' },
    { title: 'Invitations', href: '/admin/users/invitations' },
]

export function AdminSettingsPanel({ open, onClose }: AdminSettingsPanelProps) {
    const [usersExpanded, setUsersExpanded] = useState(false)

    return (
        <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="flex items-center gap-2 text-base">
                            <span className="text-lg">⚙️</span>
                            Settings
                        </SheetTitle>
                    </div>
                </SheetHeader>

                <Separator />

                <nav className="p-2 space-y-1">
                    {adminNavItems.map((item) => (
                        <Button
                            key={item.title}
                            variant="ghost"
                            className="w-full justify-start gap-3 h-11 text-sm"
                            asChild
                        >
                            <a href={item.href}>
                                <item.icon className="h-4 w-4 text-muted-foreground" />
                                {item.title}
                                {item.title === 'Style Manager' && (
                                    <Moon className="h-4 w-4 ml-auto text-muted-foreground" />
                                )}
                            </a>
                        </Button>
                    ))}

                    {/* Users with expandable sub-menu */}
                    <Collapsible open={usersExpanded} onOpenChange={setUsersExpanded}>
                        <CollapsibleTrigger asChild>
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 h-11 text-sm"
                            >
                                <Users className="h-4 w-4 text-muted-foreground" />
                                Users
                                <ChevronDown
                                    className={`h-4 w-4 ml-auto text-muted-foreground transition-transform ${usersExpanded ? 'rotate-180' : ''
                                        }`}
                                />
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pl-9 space-y-1">
                            {userSubItems.map((sub) => (
                                <Button
                                    key={sub.title}
                                    variant="ghost"
                                    className="w-full justify-start h-9 text-sm text-muted-foreground"
                                    asChild
                                >
                                    <a href={sub.href}>{sub.title}</a>
                                </Button>
                            ))}
                        </CollapsibleContent>
                    </Collapsible>
                </nav>
            </SheetContent>
        </Sheet>
    )
}

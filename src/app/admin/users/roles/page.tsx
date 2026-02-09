'use client'

import { useState, useEffect, useMemo } from 'react'
import {
    ShieldCheckIcon,
    ArrowPathIcon,
    ArrowDownTrayIcon,
    CheckIcon,
    XMarkIcon,
    ExclamationCircleIcon,
    UserIcon,
    ScaleIcon,
    EyeIcon,
    BriefcaseIcon,
    AcademicCapIcon,
    MagnifyingGlassIcon,
    UsersIcon,
    ShieldExclamationIcon,
    WrenchScrewdriverIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'

// Type definitions
type Role = {
    id: string
    name: string
    subtitle: string
    icon: string
}

type Permission = {
    id: string
    name: string
    description: string
    category: string
}

// Define permission categories
const CATEGORIES = [
    { id: 'all', name: 'All Permissions' },
    { id: 'case_management', name: 'Case Management' },
    { id: 'content', name: 'Content' },
    { id: 'moderation', name: 'Moderation' },
    { id: 'voting', name: 'Voting' },
    { id: 'administration', name: 'Administration' },
    { id: 'forms', name: 'Forms' },
]

// Map role IDs to Heroicon components
const ROLE_ICONS: Record<string, typeof UserIcon> = {
    'plaintiff': UserIcon,
    'defendant': ScaleIcon,
    'witness': EyeIcon,
    'attorney': BriefcaseIcon,
    'expert_witness': AcademicCapIcon,
    'investigator': MagnifyingGlassIcon,
    'jury_member': UsersIcon,
    'law_enforcement': ShieldExclamationIcon,
    'moderator': WrenchScrewdriverIcon,
    'admin': Cog6ToothIcon,
    'super_admin': ShieldCheckIcon
}

// Define the display order for roles (columns)
const ROLE_DISPLAY_ORDER = [
    'plaintiff',
    'defendant',
    'witness',
    'attorney',
    'expert_witness',
    'investigator',
    'jury_member',
    'law_enforcement',
    'moderator',
    'admin',
    'super_admin'
]

export default function RolesPermissionsPage() {
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [roles, setRoles] = useState<Role[]>([])
    const [permissions, setPermissions] = useState<Permission[]>([])
    const [grants, setGrants] = useState<Record<string, Record<string, boolean>>>({})
    const [originalGrants, setOriginalGrants] = useState<Record<string, Record<string, boolean>>>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch data from database
    const fetchData = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch('/api/admin/permissions')
            if (!response.ok) throw new Error('Failed to fetch permissions')

            const data = await response.json()

            // Sort roles by display order
            const sortedRoles = data.roles.sort((a: Role, b: Role) => {
                const indexA = ROLE_DISPLAY_ORDER.indexOf(a.id)
                const indexB = ROLE_DISPLAY_ORDER.indexOf(b.id)
                return indexA - indexB
            })

            setRoles(sortedRoles)
            setPermissions(data.permissions)
            setGrants(data.grants)
            setOriginalGrants(data.grants)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    // Load data on mount
    useEffect(() => {
        fetchData()
    }, [])

    // Filter permissions by category
    const filteredPermissions = useMemo(() => {
        if (selectedCategory === 'all') return permissions
        return permissions.filter(p => p.category === selectedCategory)
    }, [selectedCategory, permissions])

    // Check for unsaved changes - deep comparison treating undefined and false as equivalent
    const hasChanges = useMemo(() => {
        // Helper function to normalize grant value (treat undefined and false as equivalent)
        const normalizeValue = (val: boolean | undefined): boolean => {
            return val === true
        }

        // Check all roles and permissions
        const allRoleIds = new Set([...Object.keys(grants), ...Object.keys(originalGrants)])

        for (const roleId of allRoleIds) {
            const currentRoleGrants = grants[roleId] || {}
            const originalRoleGrants = originalGrants[roleId] || {}

            // Get all permission IDs for this role
            const allPermIds = new Set([
                ...Object.keys(currentRoleGrants),
                ...Object.keys(originalRoleGrants)
            ])

            for (const permId of allPermIds) {
                const currentVal = normalizeValue(currentRoleGrants[permId])
                const originalVal = normalizeValue(originalRoleGrants[permId])

                if (currentVal !== originalVal) {
                    return true // Found a difference
                }
            }
        }

        return false // No differences found
    }, [grants, originalGrants])

    // Get changed cells for highlighting - normalize values to treat undefined and false as equivalent
    const isChanged = (roleId: string, permId: string) => {
        const currentVal = grants[roleId]?.[permId] === true
        const originalVal = originalGrants[roleId]?.[permId] === true
        return currentVal !== originalVal
    }

    // Toggle a permission
    const togglePermission = (roleId: string, permId: string) => {
        setGrants(prev => ({
            ...prev,
            [roleId]: {
                ...prev[roleId],
                [permId]: !prev[roleId]?.[permId]
            }
        }))
    }

    // Save changes
    const handleSave = async () => {
        setSaving(true)
        setError(null)
        try {
            const response = await fetch('/api/admin/permissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ grants })
            })

            if (!response.ok) throw new Error('Failed to save permissions')

            setOriginalGrants(grants)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save changes')
        } finally {
            setSaving(false)
        }
    }

    // Refresh/reset
    const handleRefresh = () => {
        if (hasChanges) {
            setGrants(originalGrants)
        } else {
            fetchData()
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Loading permissions...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4 h-full flex flex-col">
            {/* Error Display */}
            {error && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-4">
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <ShieldCheckIcon className="h-6 w-6" style={{ color: 'hsl(var(--primary))' }} />
                        Permissions & Roles
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Configure access levels for each role
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={saving}
                        className="px-3 py-1.5 rounded-md text-sm font-medium transition-all bg-muted/50 text-foreground/80 hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <ArrowPathIcon className="h-4 w-4" />
                        Reset
                    </button>
                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={!hasChanges || saving}
                        className="bg-primary text-primary-foreground"
                    >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            {/* Category Filters and Key */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${selectedCategory === cat.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted/50 text-foreground/80 hover:bg-primary hover:text-primary-foreground'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Key/Legend */}
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                            <CheckIcon className="h-3 w-3" />
                        </div>
                        <span className="text-muted-foreground">Granted</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                            <XMarkIcon className="h-3 w-3" />
                        </div>
                        <span className="text-muted-foreground">Not Granted</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center ring-2 ring-yellow-500">
                            <ExclamationCircleIcon className="h-3 w-3" />
                        </div>
                        <span className="text-muted-foreground">Unsaved</span>
                    </div>
                </div>
            </div>

            {/* Permissions Table */}
            <div className="rounded-lg border bg-card overflow-hidden">
                <div className="overflow-auto max-h-[calc(100vh-240px)]">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 z-40 bg-muted">
                            <tr>
                                <th className="text-left p-3 font-semibold border-b min-w-[250px] bg-muted sticky left-0 z-50">
                                    Permission
                                </th>
                                {roles.map((role: Role) => {
                                    const IconComponent = ROLE_ICONS[role.id] || UserIcon
                                    return (
                                        <th key={role.id} className="p-3 border-b text-center min-w-[100px] bg-muted">
                                            <div className="flex flex-col items-center gap-1">
                                                <IconComponent className="h-5 w-5" style={{ color: 'hsl(var(--primary))' }} />
                                                <span className="text-xs font-semibold">{role.name}</span>
                                                <span className="text-[10px] text-muted-foreground">{role.subtitle}</span>
                                            </div>
                                        </th>
                                    )
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPermissions.map((perm, idx) => (
                                <tr key={perm.id} className={idx % 2 === 0 ? 'bg-card' : 'bg-secondary'}>
                                    <td className={`p-3 border-b sticky left-0 z-30 ${idx % 2 === 0 ? 'bg-card' : 'bg-secondary'}`}>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{perm.name}</span>
                                            <span className="text-[10px] text-muted-foreground">{perm.description}</span>
                                            <span className="text-[10px] text-primary mt-1 uppercase tracking-wide">
                                                {perm.category.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </td>
                                    {roles.map((role: Role) => {
                                        const granted = grants[role.id]?.[perm.id]
                                        const changed = isChanged(role.id, perm.id)
                                        return (
                                            <td key={role.id} className="p-2 border-b">
                                                <div className="flex items-center justify-center">
                                                    <button
                                                        onClick={() => togglePermission(role.id, perm.id)}
                                                        className={`
                                                            w-8 h-8 rounded-full flex items-center justify-center transition-all
                                                            ${granted
                                                                ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                                                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                            }
                                                            ${changed ? 'ring-2 ring-yellow-500 ring-offset-1 ring-offset-background' : ''}
                                                        `}
                                                    >
                                                        {granted ? (
                                                            <CheckIcon className="h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <XMarkIcon className="h-4 w-4 text-gray-400" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>


        </div>
    )
}

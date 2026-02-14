'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    UsersIcon as UsersHeroIcon,
    UserPlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon as EyeHeroIcon,
    KeyIcon,
    UserMinusIcon,
    EllipsisVerticalIcon,
    UserIcon,
    ScaleIcon,
    EyeIcon,
    BriefcaseIcon,
    AcademicCapIcon,
    MagnifyingGlassIcon,
    ShieldExclamationIcon,
    WrenchScrewdriverIcon,
    Cog6ToothIcon,
    ShieldCheckIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    ChevronUpDownIcon,
    FunnelIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Type definitions
type Role = {
    id: string
    name: string
    icon: string
}

type User = {
    id: string
    email: string
    full_name: string | null
    role: string | null
    created_at: string
    last_sign_in_at: string | null
    roles: Role[]
}

type SortField = 'email' | 'full_name' | 'created_at' | 'last_sign_in_at'
type SortDir = 'asc' | 'desc'

export default function AllUsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)

    // Sort & filter state
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState<SortField>('full_name')
    const [sortDir, setSortDir] = useState<SortDir>('asc')
    const [roleFilter, setRoleFilter] = useState('')
    const [searchDebounce, setSearchDebounce] = useState('')

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        password: '',
        selectedRoles: [] as string[]
    })

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => setSearchDebounce(search), 300)
        return () => clearTimeout(timer)
    }, [search])

    // Fetch users from database with sort/filter params
    const fetchUsers = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const params = new URLSearchParams()
            if (searchDebounce) params.set('search', searchDebounce)
            if (sortBy) params.set('sortBy', sortBy)
            if (sortDir) params.set('sortDir', sortDir)
            if (roleFilter) params.set('role', roleFilter)

            const response = await fetch(`/api/admin/users?${params.toString()}`)
            if (!response.ok) throw new Error('Failed to fetch users')

            const data = await response.json()
            setUsers(data.users)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }, [searchDebounce, sortBy, sortDir, roleFilter])

    // Sort roles: admin and super_admin always last
    const ADMIN_ROLE_IDS = ['admin', 'super_admin']
    const sortedRoles = [...roles].sort((a, b) => {
        const aIsAdmin = ADMIN_ROLE_IDS.includes(a.id) ? 1 : 0
        const bIsAdmin = ADMIN_ROLE_IDS.includes(b.id) ? 1 : 0
        if (aIsAdmin !== bIsAdmin) return aIsAdmin - bIsAdmin
        return a.name.localeCompare(b.name)
    })

    // Fetch available roles
    const fetchRoles = async () => {
        try {
            const response = await fetch('/api/admin/permissions')
            if (!response.ok) throw new Error('Failed to fetch roles')

            const data = await response.json()
            setRoles(data.roles)
        } catch (err) {
            console.error('Error fetching roles:', err)
        }
    }

    // Load data on mount and when params change
    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    useEffect(() => {
        fetchRoles()
    }, [])

    // Handle column sort toggle
    const handleSort = (field: SortField) => {
        if (sortBy === field) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(field)
            setSortDir('asc')
        }
    }

    // Sort icon for column headers
    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortBy !== field) return <ChevronUpDownIcon className="h-3.5 w-3.5 text-muted-foreground/50" />
        return sortDir === 'asc'
            ? <ChevronUpIcon className="h-3.5 w-3.5 text-primary" />
            : <ChevronDownIcon className="h-3.5 w-3.5 text-primary" />
    }

    // Toggle role selection
    const toggleRole = (roleId: string) => {
        setFormData(prev => ({
            ...prev,
            selectedRoles: prev.selectedRoles.includes(roleId)
                ? prev.selectedRoles.filter(id => id !== roleId)
                : [...prev.selectedRoles, roleId]
        }))
    }

    // Open modal for editing user
    const handleEditUser = (user: User) => {
        setEditingUser(user)
        setFormData({
            email: user.email,
            fullName: user.full_name || '',
            password: '', // Don't pre-fill password for security
            selectedRoles: user.roles.map(role => role.id)
        })
        setModalOpen(true)
    }

    // Open modal for adding new user
    const handleAddUser = () => {
        setEditingUser(null)
        setFormData({ email: '', fullName: '', password: '', selectedRoles: [] })
        setModalOpen(true)
    }

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)

        try {
            if (editingUser) {
                // TODO: Implement user update API
                console.log('Updating user:', editingUser.id, formData)
            } else {
                // TODO: Implement user creation API
                console.log('Creating user:', formData)
            }
            await new Promise(resolve => setTimeout(resolve, 1000)) // Placeholder

            // Reset form and close modal
            setFormData({ email: '', fullName: '', password: '', selectedRoles: [] })
            setEditingUser(null)
            setModalOpen(false)
            fetchUsers()
        } catch (err) {
            setError(err instanceof Error ? err.message : editingUser ? 'Failed to update user' : 'Failed to create user')
        } finally {
            setSaving(false)
        }
    }

    // Format date for display as relative time
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Never'
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 30) return `${diffDays}d ago`
        if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
        return `${Math.floor(diffDays / 365)}y ago`
    }

    // Map role IDs to Heroicon components (same as permissions table)
    const ROLE_ICONS: Record<string, typeof UserIcon> = {
        'plaintiff': UserIcon,
        'defendant': ScaleIcon,
        'witness': EyeIcon,
        'attorney': BriefcaseIcon,
        'expert_witness': AcademicCapIcon,
        'investigator': MagnifyingGlassIcon,
        'jury_member': UsersHeroIcon,
        'law_enforcement': ShieldExclamationIcon,
        'moderator': WrenchScrewdriverIcon,
        'admin': Cog6ToothIcon,
        'super_admin': ShieldCheckIcon
    }

    if (loading && users.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <UsersHeroIcon className="h-8 w-8 animate-pulse mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Loading users...</p>
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
                        <UsersHeroIcon className="h-6 w-6" style={{ color: 'hsl(var(--primary))' }} />
                        All Users
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage user accounts and role assignments
                    </p>
                </div>
                <Button
                    size="sm"
                    onClick={handleAddUser}
                >
                    <UserPlusIcon className="h-4 w-4 mr-2" />
                    Add User
                </Button>
            </div>

            {/* Search & Active Filters Bar */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by email or name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <XMarkIcon className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Active filter badges */}
                {roleFilter && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                        <FunnelIcon className="h-3 w-3" />
                        Role: {roleFilter === 'no_roles' ? 'No Roles' : roles.find(r => r.id === roleFilter)?.name || roleFilter}
                        <button
                            onClick={() => setRoleFilter('')}
                            className="ml-0.5 hover:text-primary/70"
                        >
                            <XMarkIcon className="h-3 w-3" />
                        </button>
                    </div>
                )}

                {loading && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                )}
            </div>

            {/* Table Container */}
            <div className="flex-1 rounded-lg border bg-card overflow-hidden">
                <div className="overflow-auto max-h-[calc(100vh-300px)] pb-2">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 z-40 bg-muted">
                            <tr>
                                <th className="text-left p-3 font-semibold border-b min-w-[180px] bg-muted">
                                    <button
                                        onClick={() => handleSort('full_name')}
                                        className="flex items-center gap-1.5 hover:text-primary transition-colors"
                                    >
                                        Full Name
                                        <SortIcon field="full_name" />
                                    </button>
                                </th>
                                <th className="text-left p-3 font-semibold border-b min-w-[200px] bg-muted">
                                    <button
                                        onClick={() => handleSort('email')}
                                        className="flex items-center gap-1.5 hover:text-primary transition-colors"
                                    >
                                        Email
                                        <SortIcon field="email" />
                                    </button>
                                </th>
                                <th className="text-left p-3 font-semibold border-b min-w-[200px] bg-muted">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className={`flex items-center gap-1.5 hover:text-primary transition-colors ${roleFilter ? 'text-primary' : ''}`}>
                                                Roles
                                                <FunnelIcon className={`h-3.5 w-3.5 ${roleFilter ? 'text-primary' : 'text-muted-foreground/50'}`} />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="w-48">
                                            <DropdownMenuItem
                                                onClick={() => setRoleFilter('')}
                                                className={!roleFilter ? 'bg-accent' : ''}
                                            >
                                                All Roles
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            {sortedRoles.map((role) => {
                                                const RoleIcon = ROLE_ICONS[role.id] || UserIcon
                                                return (
                                                    <DropdownMenuItem
                                                        key={role.id}
                                                        onClick={() => setRoleFilter(role.id)}
                                                        className={roleFilter === role.id ? 'bg-accent' : ''}
                                                    >
                                                        <RoleIcon className="h-4 w-4 mr-2" />
                                                        {role.name}
                                                    </DropdownMenuItem>
                                                )
                                            })}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => setRoleFilter('no_roles')}
                                                className={roleFilter === 'no_roles' ? 'bg-accent' : ''}
                                            >
                                                <XMarkIcon className="h-4 w-4 mr-2" />
                                                No Roles
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </th>
                                <th className="text-left p-3 font-semibold border-b min-w-[140px] bg-muted">
                                    <button
                                        onClick={() => handleSort('created_at')}
                                        className="flex items-center gap-1.5 hover:text-primary transition-colors"
                                    >
                                        Joined
                                        <SortIcon field="created_at" />
                                    </button>
                                </th>
                                <th className="text-left p-3 font-semibold border-b min-w-[140px] bg-muted">
                                    <button
                                        onClick={() => handleSort('last_sign_in_at')}
                                        className="flex items-center gap-1.5 hover:text-primary transition-colors"
                                    >
                                        Last Login
                                        <SortIcon field="last_sign_in_at" />
                                    </button>
                                </th>
                                <th className="text-center p-3 font-semibold border-b min-w-[120px] bg-muted">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        {search || roleFilter ? 'No users match your filters' : 'No users found'}
                                    </td>
                                </tr>
                            ) : (
                                users.map((user, idx) => (
                                    <tr key={user.id} className={idx % 2 === 0 ? 'bg-card' : 'bg-secondary'}>
                                        <td className="p-3 border-b">
                                            <span className="font-medium text-sm">{user.full_name || '—'}</span>
                                        </td>
                                        <td className="p-3 border-b">
                                            <span className="text-sm">{user.email}</span>
                                        </td>
                                        <td className="p-3 border-b">
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles.length > 0 ? (
                                                    user.roles.map((role) => {
                                                        const RoleIcon = ROLE_ICONS[role.id] || UserIcon
                                                        return (
                                                            <span
                                                                key={role.id}
                                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20"
                                                            >
                                                                <RoleIcon className="h-3 w-3" />
                                                                <span>{role.name}</span>
                                                            </span>
                                                        )
                                                    })
                                                ) : user.role ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground border border-border">
                                                        {user.role}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">No roles</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-3 border-b">
                                            <span className="text-sm text-muted-foreground">
                                                {formatDate(user.created_at)}
                                            </span>
                                        </td>
                                        <td className="p-3 border-b">
                                            <span className="text-sm text-muted-foreground">
                                                {formatDate(user.last_sign_in_at)}
                                            </span>
                                        </td>
                                        <td className="p-3 border-b">
                                            <div className="flex items-center justify-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <EllipsisVerticalIcon className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => console.log('View profile:', user.id)}>
                                                            <EyeIcon className="h-4 w-4 mr-2" />
                                                            View Profile
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                                            <PencilIcon className="h-4 w-4 mr-2" />
                                                            Edit User
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => console.log('Reset password:', user.id)}>
                                                            <KeyIcon className="h-4 w-4 mr-2" />
                                                            Reset Password
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => console.log('Suspend user:', user.id)}>
                                                            <UserMinusIcon className="h-4 w-4 mr-2" />
                                                            Suspend User
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => console.log('Delete user:', user.id)}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <TrashIcon className="h-4 w-4 mr-2" />
                                                            Delete User
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit User Modal */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-[500px] bg-muted">
                    <DialogHeader>
                        <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                        <DialogDescription>
                            {editingUser ? 'Update user information and role assignments.' : 'Create a new user account and assign roles.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-4">
                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="user@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    required
                                />
                            </div>

                            {/* Full Name */}
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Password{editingUser ? ' (leave blank to keep current)' : ''}</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                    required={!editingUser}
                                />
                            </div>

                            {/* Role Selection */}
                            <div className="space-y-2">
                                <Label>Roles</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {sortedRoles.map((role) => {
                                        const RoleIcon = ROLE_ICONS[role.id] || UserIcon
                                        return (
                                            <button
                                                key={role.id}
                                                type="button"
                                                onClick={() => toggleRole(role.id)}
                                                className={`flex items-center gap-2 p-2 rounded-lg transition-all ${formData.selectedRoles.includes(role.id)
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-background hover:bg-accent'
                                                    }`}
                                            >
                                                <RoleIcon className="h-4 w-4" />
                                                <span className="text-xs font-normal">{role.name}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {formData.selectedRoles.length} role(s) selected
                                </p>
                            </div>
                        </div>

                        <DialogFooter>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                disabled={saving}
                                className="px-3 py-1.5 rounded-md text-sm font-medium transition-all bg-muted/50 text-foreground/80 hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <Button type="submit" disabled={saving}>
                                {saving ? (editingUser ? 'Updating...' : 'Creating...') : (editingUser ? 'Update User' : 'Create User')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

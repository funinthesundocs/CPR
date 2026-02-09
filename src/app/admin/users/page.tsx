'use client'

import { useState, useEffect } from 'react'
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
    ShieldCheckIcon
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

export default function AllUsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        password: '',
        selectedRoles: [] as string[]
    })

    // Fetch users from database
    const fetchUsers = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch('/api/admin/users')
            if (!response.ok) throw new Error('Failed to fetch users')

            const data = await response.json()
            setUsers(data.users)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

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

    // Load data on mount
    useEffect(() => {
        fetchUsers()
        fetchRoles()
    }, [])

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

    // Format date for display
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Never'
        return dateString ? new Date(dateString).toLocaleDateString() : '—'
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

    if (loading) {
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

            {/* Table Container */}
            <div className="flex-1 rounded-lg border bg-card overflow-hidden">
                <div className="overflow-auto max-h-[calc(100vh-240px)] pb-2">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 z-40 bg-muted">
                            <tr>
                                <th className="text-left p-3 font-semibold border-b min-w-[200px] bg-muted">
                                    Email
                                </th>
                                <th className="text-left p-3 font-semibold border-b min-w-[180px] bg-muted">
                                    Full Name
                                </th>
                                <th className="text-left p-3 font-semibold border-b min-w-[200px] bg-muted">
                                    Roles
                                </th>
                                <th className="text-left p-3 font-semibold border-b min-w-[140px] bg-muted">
                                    Joined
                                </th>
                                <th className="text-left p-3 font-semibold border-b min-w-[140px] bg-muted">
                                    Last Login
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
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                users.map((user, idx) => (
                                    <tr key={user.id} className={idx % 2 === 0 ? 'bg-card' : 'bg-secondary'}>
                                        <td className="p-3 border-b">
                                            <span className="font-medium text-sm">{user.email}</span>
                                        </td>
                                        <td className="p-3 border-b">
                                            <span className="text-sm">{user.full_name || '—'}</span>
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

            {/* Add User Modal */}
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
                                    {roles.map((role) => {
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

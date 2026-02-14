'use client'

import { createContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

export type PermissionsContextType = {
    roles: string[]
    permissions: string[]
    isAdmin: boolean
    loading: boolean
    hasPermission: (id: string) => boolean
    hasAnyPermission: (ids: string[]) => boolean
    hasRole: (id: string) => boolean
    refetch: () => void
}

const defaultContext: PermissionsContextType = {
    roles: [],
    permissions: [],
    isAdmin: false,
    loading: true,
    hasPermission: () => false,
    hasAnyPermission: () => false,
    hasRole: () => false,
    refetch: () => { },
}

export const PermissionsContext = createContext<PermissionsContextType>(defaultContext)

export function PermissionsProvider({ children }: { children: ReactNode }) {
    const [roles, setRoles] = useState<string[]>([])
    const [permissions, setPermissions] = useState<string[]>([])
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)

    const fetchPermissions = useCallback(async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/auth/user-permissions', {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache' }
            })

            if (!response.ok) {
                setRoles([])
                setPermissions([])
                setIsAdmin(false)
                return
            }

            const data = await response.json()
            setRoles(data.roles || [])
            setPermissions(data.permissions || [])
            setIsAdmin(data.isAdmin || false)
        } catch (err) {
            console.error('Failed to fetch permissions:', err)
            setRoles([])
            setPermissions([])
            setIsAdmin(false)
        } finally {
            setLoading(false)
        }
    }, [])

    // Fetch on mount
    useEffect(() => {
        fetchPermissions()
    }, [fetchPermissions])

    // Re-fetch on auth state change
    useEffect(() => {
        const supabase = createClient()
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
                fetchPermissions()
            }
        })

        return () => subscription.unsubscribe()
    }, [fetchPermissions])

    const hasPermission = useCallback((id: string) => permissions.includes(id), [permissions])
    const hasAnyPermission = useCallback((ids: string[]) => ids.some(id => permissions.includes(id)), [permissions])
    const hasRole = useCallback((id: string) => roles.includes(id), [roles])

    return (
        <PermissionsContext.Provider
            value={{
                roles,
                permissions,
                isAdmin,
                loading,
                hasPermission,
                hasAnyPermission,
                hasRole,
                refetch: fetchPermissions,
            }}
        >
            {children}
        </PermissionsContext.Provider>
    )
}

'use client'

import { useContext } from 'react'
import { PermissionsContext, type PermissionsContextType } from '@/components/providers/permissions-provider'

/**
 * Hook to access the current user's roles and permissions.
 * All data is fetched from the database via API — never browser-stored.
 *
 * Usage:
 *   const { hasPermission, hasRole, isAdmin, loading } = usePermissions()
 *   if (hasPermission('manage_cases')) { ... }
 */
export function usePermissions(): PermissionsContextType {
    const context = useContext(PermissionsContext)
    if (!context) {
        throw new Error('usePermissions must be used within a PermissionsProvider')
    }
    return context
}

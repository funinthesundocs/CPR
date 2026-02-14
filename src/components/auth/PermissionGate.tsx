'use client'

import { type ReactNode } from 'react'
import { usePermissions } from '@/hooks/usePermissions'

type PermissionGateProps = {
    /** Single permission required */
    permission?: string
    /** Any one of these permissions is sufficient */
    anyPermission?: string[]
    /** All of these permissions are required */
    allPermissions?: string[]
    /** Role required (e.g. 'admin') */
    role?: string
    /** Content to show when access is denied (defaults to nothing) */
    fallback?: ReactNode
    /** Content to show while loading permissions */
    loadingFallback?: ReactNode
    children: ReactNode
}

/**
 * Declarative permission gate component.
 * Checks permissions against the DB-fetched permission set.
 *
 * Usage:
 *   <PermissionGate permission="manage_cases">
 *     <CaseEditForm />
 *   </PermissionGate>
 *
 *   <PermissionGate anyPermission={["moderate_content", "delete_posts"]} fallback={<AccessDenied />}>
 *     <ModerationToolbar />
 *   </PermissionGate>
 *
 *   <PermissionGate role="admin">
 *     <AdminOnlySection />
 *   </PermissionGate>
 */
export function PermissionGate({
    permission,
    anyPermission,
    allPermissions,
    role,
    fallback = null,
    loadingFallback = null,
    children,
}: PermissionGateProps) {
    const { hasPermission, hasAnyPermission, hasRole, isAdmin, loading } = usePermissions()

    if (loading) {
        return <>{loadingFallback}</>
    }

    // Super admin and admin bypass all permission checks
    if (isAdmin) {
        return <>{children}</>
    }

    // Check single permission
    if (permission && !hasPermission(permission)) {
        return <>{fallback}</>
    }

    // Check any of multiple permissions
    if (anyPermission && !hasAnyPermission(anyPermission)) {
        return <>{fallback}</>
    }

    // Check all permissions required
    if (allPermissions && !allPermissions.every(p => hasPermission(p))) {
        return <>{fallback}</>
    }

    // Check role
    if (role && !hasRole(role)) {
        return <>{fallback}</>
    }

    return <>{children}</>
}

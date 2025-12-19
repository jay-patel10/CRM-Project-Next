'use client'

import type { ReactNode } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

import { usePermissions } from '@/contexts/PermissionContext'

type Props = {
  permission: string // Format: "leads.view" or "users.create"
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Permission Guard Component
 * Usage: <PermissionGuard permission="leads.view">...</PermissionGuard>
 */
export const PermissionGuard = ({ permission, children, fallback }: Props) => {
  const { hasPermission, isLoading } = usePermissions()

  if (isLoading) return null
  if (!hasPermission(permission)) return fallback ?? null

  return <>{children}</>
}

/**
 * Multiple Permissions Guard (ANY)
 * Usage: <PermissionGuardAny permissions={["leads.view", "leads.create"]}>...</PermissionGuardAny>
 */
export const PermissionGuardAny = ({
  permissions,
  children,
  fallback
}: {
  permissions: string[]
  children: ReactNode
  fallback?: ReactNode
}) => {
  const { hasAnyPermission, isLoading } = usePermissions()

  if (isLoading) return null
  if (!hasAnyPermission(permissions)) return fallback ?? null

  return <>{children}</>
}

/**
 * Multiple Permissions Guard (ALL)
 * Usage: <PermissionGuardAll permissions={["leads.view", "leads.edit"]}>...</PermissionGuardAll>
 */
export const PermissionGuardAll = ({
  permissions,
  children,
  fallback
}: {
  permissions: string[]
  children: ReactNode
  fallback?: ReactNode
}) => {
  const { hasAllPermissions, isLoading } = usePermissions()

  if (isLoading) return null
  if (!hasAllPermissions(permissions)) return fallback ?? null

  return <>{children}</>
}

/**
 * No Permission Card - Fallback UI
 */
export const NoPermissionCard = ({ message }: { message?: string }) => (
  <Card>
    <CardContent className='flex flex-col items-center justify-center p-12'>
      <i className='tabler-lock text-[64px] text-textSecondary mbe-4' />
      <Typography variant='h5'>Access Denied</Typography>
      <Typography color='text.secondary'>{message || 'You do not have permission to access this page.'}</Typography>
    </CardContent>
  </Card>
)

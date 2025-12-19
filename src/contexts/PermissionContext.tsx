// contexts/PermissionContext.tsx
'use client'

import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

type UserData = {
  id: number
  name: string
  email: string
  roleId: number
  role: string
  permissions: string[]
}

type PermissionContextType = {
  user: UserData | null
  permissions: string[]
  hasPermission: (permissionKey: string) => boolean
  hasAnyPermission: (permissionKeys: string[]) => boolean
  hasAllPermissions: (permissionKeys: string[]) => boolean
  isAdmin: boolean
  isLoading: boolean
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined)

// ✅ Map synonyms (view <-> read, edit <-> update)
const PERMISSION_SYNONYMS: Record<string, string[]> = {
  view: ['view', 'read'],
  read: ['read', 'view'],
  edit: ['edit', 'update'],
  update: ['update', 'edit']
}

export const PermissionProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null)
  const [permissions, setPermissions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadUserPermissions = () => {
    try {
      console.log('🔐 [PermissionContext] Loading permissions...')

      const userData = localStorage.getItem('userData')

      if (!userData) {
        console.warn('⚠️ [PermissionContext] No user data')
        setUser(null)
        setPermissions([])
        setIsLoading(false)

        return
      }

      const parsedUser: UserData = JSON.parse(userData)

      console.log('👤 [PermissionContext] User:', parsedUser)
      console.log('🔑 [PermissionContext] Raw Permissions:', parsedUser.permissions)

      // Ensure permissions is an array and normalize to lowercase
      const userPermissions = Array.isArray(parsedUser.permissions)
        ? parsedUser.permissions.map(p => String(p).toLowerCase())
        : []

      setUser(parsedUser)
      setPermissions(userPermissions)

      console.log('✅ [PermissionContext] Normalized permissions:', userPermissions)
    } catch (error) {
      console.error('❌ [PermissionContext] Error:', error)
      setUser(null)
      setPermissions([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUserPermissions()

    const handleStorageChange = () => loadUserPermissions()

    window.addEventListener('storage', handleStorageChange)

    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  /**
   * Check if user has a specific permission with synonym support
   * Supports: leads.view, leads.read, users.edit, users.update
   */
  const hasPermission = (permissionKey: string): boolean => {
    if (isLoading) return false
    if (!user) return false

    // ✅ Admin has everything
    if (user.roleId === 1) return true

    const requested = permissionKey.toLowerCase()

    // ✅ Case 1: FULL permission (users.read)
    if (requested.includes('.')) {
      // Direct match
      if (permissions.includes(requested)) return true

      // Synonym support (read <-> view, edit <-> update)
      const [module, action] = requested.split('.')
      const synonyms = PERMISSION_SYNONYMS[action] || []

      return synonyms.some(a => permissions.includes(`${module}.${a}`))
    }

    // ✅ Case 2: MODULE-ONLY permission (users, leads)
    // Allow if user has ANY permission under that module
    return permissions.some(p => p.startsWith(`${requested}.`))
  }

  /**
   * Check if user has ANY of the specified permissions
   */
  const hasAnyPermission = (permissionKeys: string[]): boolean => {
    if (user?.roleId === 1) return true

    return permissionKeys.some(key => hasPermission(key))
  }

  /**
   * Check if user has ALL of the specified permissions
   */
  const hasAllPermissions = (permissionKeys: string[]): boolean => {
    if (user?.roleId === 1) return true

    return permissionKeys.every(key => hasPermission(key))
  }

  return (
    <PermissionContext.Provider
      value={{
        user,
        permissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        isAdmin: user?.roleId === 1,
        isLoading
      }}
    >
      {children}
    </PermissionContext.Provider>
  )
}

export const usePermissions = () => {
  const ctx = useContext(PermissionContext)

  if (!ctx) throw new Error('usePermissions must be used inside PermissionProvider')

  return ctx
}

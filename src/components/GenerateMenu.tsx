// components/GenerateMenu.tsx
'use client'

import { useParams } from 'next/navigation'

import type { Locale } from '@configs/i18n'

import { usePermissions } from '@/contexts/PermissionContext'

import type {
  VerticalMenuDataType,
  VerticalSectionDataType,
  VerticalSubMenuDataType,
  VerticalMenuItemDataType
} from '@/types/menuTypes'

import { MenuItem as VerticalMenuItem, SubMenu as VerticalSubMenu, MenuSection } from '@menu/vertical-menu'

import { getLocalizedUrl } from '@/utils/i18n'

export const GenerateVerticalMenu = ({ menuData }: { menuData: VerticalMenuDataType[] }) => {
  const { lang: locale } = useParams()
  const { hasPermission, isAdmin } = usePermissions()

  /**
   * ✅ Check if user has permission for this item
   */
  const checkPermission = (permission: any): boolean => {
    if (!permission) return true
    if (isAdmin) return true

    if (typeof permission === 'string') {
      const key = permission.toLowerCase()

      // FULL permission like "users.read"
      if (key.includes('.')) {
        return hasPermission(key)
      }

      // MODULE-only permission like "users"
      // ✅ allow if user has ANY users.*
      return permissions.some(p => p.startsWith(`${key}.`))
    }

    if (typeof permission === 'object' && permission.module) {
      const module = permission.module.toLowerCase()

      if (permission.action) {
        return hasPermission(`${module}.${permission.action}`)
      }

      return permissions.some(p => p.startsWith(`${module}.`))
    }

    return false
  }

  /**
   * ✅ Check if ANY child has permission (recursive)
   */
  const hasAnyChildPermission = (children?: VerticalMenuDataType[]): boolean => {
    if (!children || children.length === 0) return false

    return children.some(child => {
      // Check if this child has permission
      if (checkPermission(child.permission)) return true

      // Recursively check nested children
      if ((child as VerticalSubMenuDataType).children) {
        return hasAnyChildPermission((child as VerticalSubMenuDataType).children)
      }

      return false
    })
  }

  /**
   * ✅ Render menu items recursively
   */
  const renderMenuItems = (data: VerticalMenuDataType[]) => {
    return data
      .map((item, index) => {
        const itemHasPermission = checkPermission(item.permission)
        const childHasPermission = hasAnyChildPermission((item as VerticalSubMenuDataType).children)

        // 🚫 Hide if neither item nor children have permission
        if (!itemHasPermission && !childHasPermission) {
          return null
        }

        // ───────── Section ─────────
        if ((item as VerticalSectionDataType).isSection) {
          const { children, ...rest } = item as VerticalSectionDataType

          // Filter children with permissions
          const visibleChildren = children?.filter(child => {
            const hasOwnPerm = checkPermission(child.permission)
            const hasChildPerm = hasAnyChildPermission((child as VerticalSubMenuDataType).children)

            return hasOwnPerm || hasChildPerm
          })

          // Don't show empty sections
          if (!visibleChildren || visibleChildren.length === 0) {
            return null
          }

          return (
            <MenuSection key={index} {...rest}>
              {renderMenuItems(visibleChildren)}
            </MenuSection>
          )
        }

        // ───────── SubMenu ─────────
        if ((item as VerticalSubMenuDataType).children) {
          const { children, icon, ...rest } = item as VerticalSubMenuDataType

          // Filter children with permissions
          const visibleChildren = children?.filter(child => {
            const hasOwnPerm = checkPermission(child.permission)
            const hasChildPerm = hasAnyChildPermission((child as VerticalSubMenuDataType).children)

            return hasOwnPerm || hasChildPerm
          })

          // Don't show empty submenus
          if (!visibleChildren || visibleChildren.length === 0) {
            return null
          }

          return (
            <VerticalSubMenu key={index} {...rest} icon={icon && <i className={icon} />}>
              {renderMenuItems(visibleChildren)}
            </VerticalSubMenu>
          )
        }

        // ───────── Menu Item ─────────
        const { label, icon, href, excludeLang } = item as VerticalMenuItemDataType

        const finalHref = href?.startsWith('http')
          ? href
          : excludeLang
            ? href
            : getLocalizedUrl(href!, locale as Locale)

        return (
          <VerticalMenuItem key={index} href={finalHref} icon={icon && <i className={icon} />}>
            {label}
          </VerticalMenuItem>
        )
      })
      .filter(Boolean) // Remove null items
  }

  return <>{renderMenuItems(menuData)}</>
}

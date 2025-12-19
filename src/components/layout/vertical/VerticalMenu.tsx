'use client'

import { useParams } from 'next/navigation'

import { useTheme } from '@mui/material/styles'
import PerfectScrollbar from 'react-perfect-scrollbar'

import type { getDictionary } from '@/utils/getDictionary'
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { usePermissions } from '@/contexts/PermissionContext'

import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ dictionary, scrollMenu }: Props) => {
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const params = useParams()
  const { isBreakpointReached } = useVerticalNav()

  // 🔐 RBAC
  const { hasPermission, isAdmin, isLoading } = usePermissions()

  const { transitionDuration } = verticalNavOptions
  const { lang: locale } = params as { lang: string }

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  // 🔐 Permission checks for each module
  const canViewLeads = isAdmin || hasPermission('Leads', 'view')
  const canViewCustomers = isAdmin || hasPermission('Customers', 'view')
  const canViewProducts = isAdmin || hasPermission('Products', 'view')
  const canViewOrders = isAdmin || hasPermission('Orders', 'view')
  const canViewEmail = isAdmin || hasPermission('Email', 'view')
  const canViewEmailTemplates = isAdmin || hasPermission('EmailTemplates', 'view')
  const canViewChat = isAdmin || hasPermission('Chat', 'view')
  const canViewCalendar = isAdmin || hasPermission('Calendar', 'view')
  const canViewUsers = isAdmin || hasPermission('Users', 'view')
  const canViewRoles = isAdmin || hasPermission('Roles', 'view')
  const canViewSettings = isAdmin || hasPermission('Settings', 'view')

  // Show CRM section if user has access to ANY CRM module
  const canViewCRM = canViewLeads || canViewCustomers || canViewProducts || canViewOrders

  // Show Communication section if user has access to ANY communication module
  const canViewCommunication = canViewEmail || canViewEmailTemplates || canViewChat || canViewCalendar

  // Show Admin section if user has access to ANY admin module
  const canViewAdmin = canViewUsers || canViewRoles || canViewSettings

  if (isLoading) return null

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {/* Dashboard - Always visible */}
        <MenuItem href={`/${locale}/dashboards/crm`} icon={<i className='tabler-smart-home' />}>
          Dashboard
        </MenuItem>

        {/* ===== CRM MANAGEMENT ===== */}
        {canViewCRM && (
          <MenuSection label='CRM MANAGEMENT'>
            {/* Leads */}
            {canViewLeads && (
              <SubMenu label='Leads' icon={<i className='tabler-user-check' />}>
                <MenuItem href={`/${locale}/apps/leads/list`}>All Leads</MenuItem>
                <MenuItem href={`/${locale}/apps/kanban`}>Lead Pipeline</MenuItem>
                <MenuItem href={`/${locale}/apps/leads/my-leads`}>My Leads</MenuItem>
              </SubMenu>
            )}

            {/* Customers */}
            {canViewCustomers && (
              <SubMenu label='Customers' icon={<i className='tabler-users' />}>
                <MenuItem href={`/${locale}/apps/ecommerce/customers/list`}>Customer List</MenuItem>
                <MenuItem
                  href={`/${locale}/apps/ecommerce/customers/details/879861`}
                  exactMatch={false}
                  activeUrl='/apps/ecommerce/customers/details'
                >
                  Customer Details
                </MenuItem>
              </SubMenu>
            )}

            {/* Products */}
            {canViewProducts && (
              <SubMenu label='Products & Services' icon={<i className='tabler-package' />}>
                <MenuItem href={`/${locale}/apps/ecommerce/products/list`}>Product List</MenuItem>
                <MenuItem href={`/${locale}/apps/ecommerce/products/add`}>Add Product</MenuItem>
                <MenuItem href={`/${locale}/apps/ecommerce/products/category`}>Categories</MenuItem>
              </SubMenu>
            )}

            {/* Orders */}
            {canViewOrders && (
              <SubMenu label='Orders & Deals' icon={<i className='tabler-shopping-cart' />}>
                <MenuItem href={`/${locale}/apps/ecommerce/orders/list`}>Order List</MenuItem>
                <MenuItem
                  href={`/${locale}/apps/ecommerce/orders/details/5434`}
                  exactMatch={false}
                  activeUrl='/apps/ecommerce/orders/details'
                >
                  Order Details
                </MenuItem>
              </SubMenu>
            )}
          </MenuSection>
        )}

        {/* ===== COMMUNICATION ===== */}
        {canViewCommunication && (
          <MenuSection label='COMMUNICATION'>
            {canViewEmail && (
              <MenuItem
                href={`/${locale}/apps/email`}
                icon={<i className='tabler-mail' />}
                exactMatch={false}
                activeUrl='/apps/email'
              >
                Email
              </MenuItem>
            )}

            {canViewChat && (
              <MenuItem href={`/${locale}/apps/chat`} icon={<i className='tabler-message-circle-2' />}>
                Chat
              </MenuItem>
            )}

            {canViewCalendar && (
              <MenuItem href={`/${locale}/apps/calendar`} icon={<i className='tabler-calendar' />}>
                Calendar
              </MenuItem>
            )}

            {canViewEmailTemplates && (
              <SubMenu label='Email Templates' icon={<i className='tabler-template' />}>
                <MenuItem href={`/${locale}/apps/email-templates/list`}>All Templates</MenuItem>
                <MenuItem href={`/${locale}/apps/email-templates/add`}>Create Template</MenuItem>
              </SubMenu>
            )}
          </MenuSection>
        )}

        {/* ===== ADMIN & SETTINGS ===== */}
        {canViewAdmin && (
          <MenuSection label='ADMIN & SETTINGS'>
            {/* Users */}
            {canViewUsers && (
              <SubMenu label='User Management' icon={<i className='tabler-user' />}>
                <MenuItem href={`/${locale}/apps/user/list`}>User List</MenuItem>
                <MenuItem href={`/${locale}/apps/user/view`}>View User</MenuItem>
              </SubMenu>
            )}

            {/* Roles & Permissions */}
            {canViewRoles && (
              <SubMenu label='Roles & Permissions' icon={<i className='tabler-lock' />}>
                <MenuItem href={`/${locale}/apps/roles`}>Roles</MenuItem>
                <MenuItem href={`/${locale}/apps/permissions`}>Permissions</MenuItem>
              </SubMenu>
            )}

            {/* Settings - Only show if admin or has Settings.view */}
            {canViewSettings && (
              <>
                <MenuItem href={`/${locale}/apps/api-keys`} icon={<i className='tabler-key' />}>
                  API Keys
                </MenuItem>

                <MenuItem href={`/${locale}/apps/api-integration`} icon={<i className='tabler-api' />}>
                  3rd Party API
                </MenuItem>

                <MenuItem href={`/${locale}/apps/google-tag-manager`} icon={<i className='tabler-brand-google' />}>
                  Google Tag Manager
                </MenuItem>

                <MenuItem href={`/${locale}/apps/activity-logs`} icon={<i className='tabler-activity' />}>
                  Activity Logs
                </MenuItem>

                <MenuItem href={`/${locale}/apps/ecommerce/settings`} icon={<i className='tabler-settings' />}>
                  CRM Settings
                </MenuItem>
              </>
            )}
          </MenuSection>
        )}

        {/* ===== MY ACCOUNT - Always visible ===== */}
        <MenuSection label='MY ACCOUNT'>
          <MenuItem href={`/${locale}/pages/user-profile`} icon={<i className='tabler-user-circle' />}>
            My Profile
          </MenuItem>
          <MenuItem href={`/${locale}/pages/account-settings`} icon={<i className='tabler-settings' />}>
            Account Settings
          </MenuItem>
        </MenuSection>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu

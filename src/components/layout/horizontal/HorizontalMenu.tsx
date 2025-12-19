// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Type Imports
import type { getDictionary } from '@/utils/getDictionary'
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import HorizontalNav, { Menu, SubMenu, MenuItem } from '@menu/horizontal-menu'
import VerticalNavContent from './VerticalNavContent'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useSettings } from '@core/hooks/useSettings'

// Styled Component Imports
import StyledHorizontalNavExpandIcon from '@menu/styles/horizontal/StyledHorizontalNavExpandIcon'
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/horizontal/menuItemStyles'
import menuRootStyles from '@core/styles/horizontal/menuRootStyles'
import verticalNavigationCustomStyles from '@core/styles/vertical/navigationCustomStyles'
import verticalMenuItemStyles from '@core/styles/vertical/menuItemStyles'
import verticalMenuSectionStyles from '@core/styles/vertical/menuSectionStyles'

type RenderExpandIconProps = {
  level?: number
}

type RenderVerticalExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

const RenderExpandIcon = ({ level }: RenderExpandIconProps) => (
  <StyledHorizontalNavExpandIcon level={level}>
    <i className='tabler-chevron-right' />
  </StyledHorizontalNavExpandIcon>
)

const RenderVerticalExpandIcon = ({ open, transitionDuration }: RenderVerticalExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const HorizontalMenu = ({ dictionary }: { dictionary: Awaited<ReturnType<typeof getDictionary>> }) => {
  // Hooks
  const verticalNavOptions = useVerticalNav()
  const theme = useTheme()
  const { settings } = useSettings()
  const params = useParams()

  // Vars
  const { skin } = settings
  const { transitionDuration } = verticalNavOptions
  const { lang: locale } = params

  return (
    <HorizontalNav
      switchToVertical
      verticalNavContent={VerticalNavContent}
      verticalNavProps={{
        customStyles: verticalNavigationCustomStyles(verticalNavOptions, theme),
        backgroundColor:
          skin === 'bordered' ? 'var(--mui-palette-background-paper)' : 'var(--mui-palette-background-default)'
      }}
    >
      <Menu
        rootStyles={menuRootStyles(theme)}
        renderExpandIcon={({ level }) => <RenderExpandIcon level={level} />}
        menuItemStyles={menuItemStyles(theme, 'tabler-circle')}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        popoutMenuOffset={{
          mainAxis: ({ level }) => (level && level > 0 ? 14 : 12),
          alignmentAxis: 0
        }}
        verticalMenuProps={{
          menuItemStyles: verticalMenuItemStyles(verticalNavOptions, theme),
          renderExpandIcon: ({ open }) => (
            <RenderVerticalExpandIcon open={open} transitionDuration={transitionDuration} />
          ),
          renderExpandedMenuItemIcon: { icon: <i className='tabler-circle text-xs' /> },
          menuSectionStyles: verticalMenuSectionStyles(verticalNavOptions, theme)
        }}
      >
        {/* Dashboard */}
        <MenuItem href={`/${locale}/dashboards/crm`} icon={<i className='tabler-smart-home' />}>
          Dashboard
        </MenuItem>

        {/* CRM */}
        <SubMenu label='CRM' icon={<i className='tabler-briefcase' />}>
          <SubMenu label='Leads' icon={<i className='tabler-user-check' />}>
            <MenuItem href={`/${locale}/apps/leads/list`}>All Leads</MenuItem>
            <MenuItem href={`/${locale}/apps/kanban`}>Lead Pipeline</MenuItem>
            <MenuItem href={`/${locale}/apps/leads/my-leads`}>My Leads</MenuItem>
          </SubMenu>

          <SubMenu label='Customers' icon={<i className='tabler-users' />}>
            <MenuItem href={`/${locale}/apps/ecommerce/customers/list`}>Customer List</MenuItem>
            <MenuItem href={`/${locale}/apps/ecommerce/customers/details/879861`}>Customer Details</MenuItem>
          </SubMenu>

          <SubMenu label='Products & Services' icon={<i className='tabler-package' />}>
            <MenuItem href={`/${locale}/apps/ecommerce/products/list`}>Product List</MenuItem>
            <MenuItem href={`/${locale}/apps/ecommerce/products/add`}>Add Product</MenuItem>
            <MenuItem href={`/${locale}/apps/ecommerce/products/category`}>Categories</MenuItem>
          </SubMenu>

          <SubMenu label='Orders & Deals' icon={<i className='tabler-shopping-cart' />}>
            <MenuItem href={`/${locale}/apps/ecommerce/orders/list`}>Order List</MenuItem>
            <MenuItem href={`/${locale}/apps/ecommerce/orders/details/5434`}>Order Details</MenuItem>
          </SubMenu>
        </SubMenu>

        {/* Communication */}
        <SubMenu label='Communication' icon={<i className='tabler-message' />}>
          <MenuItem href={`/${locale}/apps/email`} icon={<i className='tabler-mail' />}>
            Email
          </MenuItem>
          <MenuItem href={`/${locale}/apps/chat`} icon={<i className='tabler-message-circle-2' />}>
            Chat
          </MenuItem>
          <MenuItem href={`/${locale}/apps/calendar`} icon={<i className='tabler-calendar' />}>
            Calendar
          </MenuItem>
          <SubMenu label='Email Templates' icon={<i className='tabler-template' />}>
            <MenuItem href={`/${locale}/apps/email-templates/list`}>All Templates</MenuItem>
            <MenuItem href={`/${locale}/apps/email-templates/add`}>Create Template</MenuItem>
          </SubMenu>
        </SubMenu>

        {/* Billing */}
        <SubMenu label='Billing' icon={<i className='tabler-credit-card' />}>
          <MenuItem href={`/${locale}/apps/subscriptions/plans`}>Subscription Plans</MenuItem>
          <MenuItem href={`/${locale}/apps/subscriptions/list`}>User Subscriptions</MenuItem>
          <MenuItem href={`/${locale}/apps/subscriptions/payments`}>Payments</MenuItem>
          <MenuItem href={`/${locale}/apps/ecommerce/referrals`}>Referrals</MenuItem>
        </SubMenu>

        {/* Admin */}
        <SubMenu label='Admin' icon={<i className='tabler-settings' />}>
          <SubMenu label='Users' icon={<i className='tabler-user' />}>
            <MenuItem href={`/${locale}/apps/user/list`}>User List</MenuItem>
            <MenuItem href={`/${locale}/apps/user/view`}>View User</MenuItem>
          </SubMenu>
          <SubMenu label='Roles & Permissions' icon={<i className='tabler-lock' />}>
            <MenuItem href={`/${locale}/apps/roles`}>Roles</MenuItem>
            <MenuItem href={`/${locale}/apps/permissions`}>Permissions</MenuItem>
          </SubMenu>
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
        </SubMenu>

        {/* Profile */}
        <SubMenu label='Account' icon={<i className='tabler-user-circle' />}>
          <MenuItem href={`/${locale}/pages/user-profile`}>My Profile</MenuItem>
          <MenuItem href={`/${locale}/pages/account-settings`}>Account Settings</MenuItem>
        </SubMenu>
      </Menu>
    </HorizontalNav>
  )
}

export default HorizontalMenu

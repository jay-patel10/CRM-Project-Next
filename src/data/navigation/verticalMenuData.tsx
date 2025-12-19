// data/navigation/verticalMenuData.tsx
import type { VerticalMenuDataType } from '@/types/menuTypes'
import type { getDictionary } from '@/utils/getDictionary'

const verticalMenuData = (dictionary: Awaited<ReturnType<typeof getDictionary>>): VerticalMenuDataType[] => [
  {
    label: dictionary['navigation'].dashboards,
    icon: 'tabler-smart-home',
    children: [
      {
        label: dictionary['navigation'].crm,
        icon: 'tabler-circle',
        href: '/dashboards/crm'
      },
      {
        label: dictionary['navigation'].analytics,
        icon: 'tabler-circle',
        href: '/dashboards/analytics'
      },
      {
        label: dictionary['navigation'].eCommerce,
        icon: 'tabler-circle',
        href: '/dashboards/ecommerce'
      }
    ]
  },

  // ✅ Apps Section with RBAC
  {
    label: 'Apps & Pages',
    isSection: true,
    children: [
      // 🔐 Leads - Protected (using .read to match backend)
      {
        label: 'Leads',
        icon: 'tabler-users-group',
        permission: 'leads.read', // Matches backend permission
        children: [
          {
            label: 'All Leads',
            icon: 'tabler-circle',
            href: '/apps/leads/list',
            permission: 'leads.read'
          },
          {
            label: 'My Leads',
            icon: 'tabler-circle',
            href: '/apps/leads/my-leads',
            permission: 'leads.read'
          },
          {
            label: 'Create Lead',
            icon: 'tabler-circle',
            href: '/apps/leads/create',
            permission: 'leads.create'
          }
        ]
      },

      // 🔐 User Management - Protected
      {
        label: dictionary['navigation'].user,
        icon: 'tabler-user',
        permission: 'users.read', // Matches backend permission
        children: [
          {
            label: dictionary['navigation'].list,
            icon: 'tabler-circle',
            href: '/apps/user/list',
            permission: 'users.read'
          },
          {
            label: dictionary['navigation'].view,
            icon: 'tabler-circle',
            href: '/apps/user/view',
            permission: 'users.read'
          }
        ]
      },

      // 🔐 Roles & Permissions - Admin Only
      {
        label: dictionary['navigation'].rolesPermissions,
        icon: 'tabler-lock',
        permission: 'roles.read', // Update to match your backend
        children: [
          {
            label: dictionary['navigation'].roles,
            icon: 'tabler-circle',
            href: '/apps/roles',
            permission: 'roles.read'
          },
          {
            label: dictionary['navigation'].permissions,
            icon: 'tabler-circle',
            href: '/apps/permissions',
            permission: 'permissions.read'
          }
        ]
      },

      // Public apps (no permissions needed)
      {
        label: dictionary['navigation'].email,
        icon: 'tabler-mail',
        href: '/apps/email',
        exactMatch: false,
        activeUrl: '/apps/email'
      },
      {
        label: dictionary['navigation'].chat,
        icon: 'tabler-message-circle-2',
        href: '/apps/chat'
      },
      {
        label: dictionary['navigation'].calendar,
        icon: 'tabler-calendar',
        href: '/apps/calendar'
      }
    ]
  }
]

export default verticalMenuData

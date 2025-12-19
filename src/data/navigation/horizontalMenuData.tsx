// data/navigation/horizontalMenuData.tsx
import type { HorizontalMenuDataType } from '@/types/menuTypes'
import type { getDictionary } from '@/utils/getDictionary'

const horizontalMenuData = (dictionary: Awaited<ReturnType<typeof getDictionary>>): HorizontalMenuDataType[] => [
  // Dashboards
  {
    label: dictionary['navigation'].dashboards,
    icon: 'tabler-smart-home',
    children: [
      {
        label: dictionary['navigation'].crm,
        icon: 'tabler-chart-pie-2',
        href: '/dashboards/crm'
      },
      {
        label: dictionary['navigation'].analytics,
        icon: 'tabler-trending-up',
        href: '/dashboards/analytics'
      },
      {
        label: dictionary['navigation'].eCommerce,
        icon: 'tabler-shopping-cart',
        href: '/dashboards/ecommerce'
      }
    ]
  },

  // Apps with RBAC
  {
    label: dictionary['navigation'].apps,
    icon: 'tabler-mail',
    children: [
      // 🔐 Leads Section - RBAC Protected
      {
        label: 'Leads',
        icon: 'tabler-users-group',
        permission: 'leads.view', // Permission required
        children: [
          {
            label: 'All Leads',
            href: '/apps/leads/list',
            permission: 'leads.view_all'
          },
          {
            label: 'My Leads',
            href: '/apps/leads/my-leads',
            permission: 'leads.view'
          },
          {
            label: 'Create Lead',
            href: '/apps/leads/create',
            permission: 'leads.create'
          }
        ]
      },

      // 🔐 E-Commerce - RBAC Protected
      {
        label: dictionary['navigation'].eCommerce,
        icon: 'tabler-shopping-cart',
        permission: 'ecommerce.view',
        children: [
          {
            label: dictionary['navigation'].dashboard,
            href: '/apps/ecommerce/dashboard',
            permission: 'ecommerce.dashboard'
          },
          {
            label: dictionary['navigation'].products,
            permission: 'products.view',
            children: [
              {
                label: dictionary['navigation'].list,
                href: '/apps/ecommerce/products/list',
                permission: 'products.view'
              },
              {
                label: dictionary['navigation'].add,
                href: '/apps/ecommerce/products/add',
                permission: 'products.create'
              },
              {
                label: dictionary['navigation'].category,
                href: '/apps/ecommerce/products/category',
                permission: 'products.manage_categories'
              }
            ]
          },
          {
            label: dictionary['navigation'].orders,
            permission: 'orders.view',
            children: [
              {
                label: dictionary['navigation'].list,
                href: '/apps/ecommerce/orders/list',
                permission: 'orders.view'
              },
              {
                label: dictionary['navigation'].details,
                href: '/apps/ecommerce/orders/details/5434',
                exactMatch: false,
                activeUrl: '/apps/ecommerce/orders/details',
                permission: 'orders.view'
              }
            ]
          },
          {
            label: dictionary['navigation'].customers,
            permission: 'customers.view',
            children: [
              {
                label: dictionary['navigation'].list,
                href: '/apps/ecommerce/customers/list',
                permission: 'customers.view'
              },
              {
                label: dictionary['navigation'].details,
                href: '/apps/ecommerce/customers/details/879861',
                exactMatch: false,
                activeUrl: '/apps/ecommerce/customers/details',
                permission: 'customers.view'
              }
            ]
          },
          {
            label: dictionary['navigation'].manageReviews,
            href: '/apps/ecommerce/manage-reviews',
            permission: 'reviews.manage'
          },
          {
            label: dictionary['navigation'].referrals,
            href: '/apps/ecommerce/referrals',
            permission: 'referrals.view'
          },
          {
            label: dictionary['navigation'].settings,
            href: '/apps/ecommerce/settings',
            permission: 'ecommerce.settings'
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
      },
      {
        label: dictionary['navigation'].kanban,
        icon: 'tabler-copy',
        href: '/apps/kanban'
      },

      // 🔐 User Management - RBAC Protected
      {
        label: dictionary['navigation'].user,
        icon: 'tabler-user',
        permission: 'users.view',
        children: [
          {
            label: dictionary['navigation'].list,
            icon: 'tabler-circle',
            href: '/apps/user/list',
            permission: 'users.view'
          },
          {
            label: dictionary['navigation'].view,
            icon: 'tabler-circle',
            href: '/apps/user/view',
            permission: 'users.view'
          }
        ]
      },

      // 🔐 Roles & Permissions - Admin Only
      {
        label: dictionary['navigation'].rolesPermissions,
        icon: 'tabler-lock',
        permission: 'roles.view',
        children: [
          {
            label: dictionary['navigation'].roles,
            icon: 'tabler-circle',
            href: '/apps/roles',
            permission: 'roles.view'
          },
          {
            label: dictionary['navigation'].permissions,
            icon: 'tabler-circle',
            href: '/apps/permissions',
            permission: 'permissions.view'
          }
        ]
      }
    ]
  },

  // Pages section (keeping existing structure)
  {
    label: dictionary['navigation'].pages,
    icon: 'tabler-file',
    children: [
      {
        label: dictionary['navigation'].userProfile,
        icon: 'tabler-user-circle',
        href: '/pages/user-profile'
      },
      {
        label: dictionary['navigation'].accountSettings,
        icon: 'tabler-settings',
        href: '/pages/account-settings'
      },
      {
        label: dictionary['navigation'].faq,
        icon: 'tabler-help-circle',
        href: '/pages/faq'
      },
      {
        label: dictionary['navigation'].pricing,
        icon: 'tabler-currency-dollar',
        href: '/pages/pricing'
      }
    ]
  },

  // Charts
  {
    label: dictionary['navigation'].charts,
    icon: 'tabler-chart-donut-2',
    children: [
      {
        label: dictionary['navigation'].apex,
        icon: 'tabler-chart-ppf',
        href: '/charts/apex-charts'
      },
      {
        label: dictionary['navigation'].recharts,
        icon: 'tabler-chart-sankey',
        href: '/charts/recharts'
      }
    ]
  }
]

export default horizontalMenuData

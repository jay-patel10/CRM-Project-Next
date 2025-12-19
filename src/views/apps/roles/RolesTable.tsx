// RolesTable.tsx
// Save as: src/views/apps/roles/RolesTable.tsx

'use client'

import { useState, useMemo, useEffect } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import Avatar from '@mui/material/Avatar'
import type { TextFieldProps } from '@mui/material/TextField'

import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

import type { ThemeColor } from '@core/types'
import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'
import { showToast } from '@/utils/toast'

import tableStyles from '@core/styles/table.module.css'
import { usePermissions } from '@/contexts/PermissionContext'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type UserType = {
  id: number
  name: string
  email: string
  phone?: string
  roleName: string
  roleId: number
  isActive: boolean
}

type UserWithAction = UserType & {
  action?: string
}

type UserStatusType = {
  [key: string]: ThemeColor
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value, onChange, debounce])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

const userStatusObj: UserStatusType = {
  true: 'success',
  false: 'secondary'
}

const columnHelper = createColumnHelper<UserWithAction>()

const RolesTable = () => {
  const { hasPermission } = usePermissions()
  const [roleFilter, setRoleFilter] = useState('')
  const [roles, setRoles] = useState<Array<{ id: number; name: string }>>([])
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<UserType[]>([])
  const [filteredData, setFilteredData] = useState<UserType[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [loading, setLoading] = useState(true)

  // Load roles for filter dropdown
  const loadRoles = async () => {
    try {
      console.log('🔍 [RolesTable] Loading roles for filter...')
      const token = localStorage.getItem('accessToken')

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const json = await res.json()

      console.log('📦 [RolesTable] Roles loaded:', json.roles?.length || 0)

      if (json.success && Array.isArray(json.roles)) {
        setRoles(json.roles)
      } else {
        setRoles([])
      }
    } catch (err) {
      console.error('❌ [RolesTable] Failed to fetch roles:', err)
      setRoles([])
    }
  }

  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true)
      console.log('🔍 [RolesTable] Loading users...')

      const token = localStorage.getItem('accessToken')

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const json = await res.json()

      console.log('📦 [RolesTable] Users loaded:', json.users?.length || 0)

      if (json.success && Array.isArray(json.users)) {
        setData(json.users)
        setFilteredData(json.users)
      } else {
        setData([])
        setFilteredData([])
      }
    } catch (err) {
      console.error('❌ [RolesTable] Failed to fetch users:', err)
      showToast.error('Failed to load users')
      setData([])
      setFilteredData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRoles()
    loadUsers()
  }, [])

  // Filter by role
  useEffect(() => {
    const filtered = data.filter(user => {
      if (roleFilter && user.roleName !== roleFilter) return false

      return true
    })

    setFilteredData(filtered)
  }, [roleFilter, data])

  const handleDelete = async (id: number, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"?`)) return

    try {
      const token = localStorage.getItem('accessToken')

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      const json = await res.json()

      if (json.success) {
        showToast.success('User deleted successfully!')
        loadUsers()
      } else {
        showToast.error(json.message || 'Failed to delete user')
      }
    } catch (err) {
      console.error('❌ [RolesTable] Delete error:', err)
      showToast.error('Error deleting user')
    }
  }

  const handleToggleStatus = async (id: number, currentStatus: boolean, userName: string) => {
    try {
      const token = localStorage.getItem('accessToken')

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      const json = await res.json()

      if (json.success) {
        showToast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`)
        loadUsers()
      } else {
        showToast.error(json.message || 'Failed to update status')
      }
    } catch (err) {
      console.error('❌ [RolesTable] Update error:', err)
      showToast.error('Error updating user')
    }
  }

  const columns = useMemo<ColumnDef<UserWithAction, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      columnHelper.accessor('name', {
        header: 'User',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Avatar alt={row.original.name} sx={{ width: 34, height: 34 }}>
              {row.original.name[0]}
            </Avatar>
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.name}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {row.original.email}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('phone', {
        header: 'Phone',
        cell: ({ row }) => <Typography>{row.original.phone || '-'}</Typography>
      }),
      columnHelper.accessor('roleName', {
        header: 'Role',
        cell: ({ row }) => (
          <Chip label={row.original.roleName} variant='tonal' size='small' color='primary' className='capitalize' />
        )
      }),
      columnHelper.accessor('isActive', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            className='capitalize'
            label={row.original.isActive ? 'Active' : 'Inactive'}
            size='small'
            color={userStatusObj[String(row.original.isActive)]}
          />
        )
      }),
      columnHelper.accessor('action', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center'>
            {/* ✅ Fixed: Use correct permission key format */}
            {hasPermission('users.delete') && (
              <IconButton
                onClick={() => handleDelete(row.original.id, row.original.name)}
                disabled={row.original.id === 1}
              >
                <i className='tabler-trash text-textSecondary' />
              </IconButton>
            )}

            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
                hasPermission('users.view') && {
                  text: 'View Details',
                  icon: 'tabler-eye',
                  menuItemProps: {
                    className: 'flex items-center gap-2 text-textSecondary',
                    onClick: () => showToast.info('View details - implement as needed')
                  }
                },

                hasPermission('users.edit') && {
                  text: 'Edit',
                  icon: 'tabler-edit',
                  menuItemProps: {
                    className: 'flex items-center gap-2 text-textSecondary',
                    onClick: () => showToast.info('Edit functionality - implement as needed')
                  }
                },

                hasPermission('users.edit') && {
                  text: row.original.isActive ? 'Deactivate' : 'Activate',
                  icon: row.original.isActive ? 'tabler-user-off' : 'tabler-user-check',
                  menuItemProps: {
                    className: 'flex items-center gap-2 text-textSecondary',
                    onClick: () => handleToggleStatus(row.original.id, row.original.isActive, row.original.name)
                  }
                }
              ].filter(Boolean)}
            />
          </div>
        ),
        enableSorting: false
      })
    ],
    [data, filteredData]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, globalFilter },
    initialState: { pagination: { pageSize: 10 } },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading users...</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className='flex justify-between flex-col gap-4 items-start sm:flex-row sm:items-center'>
        <div className='flex items-center gap-2'>
          <Typography>Show</Typography>
          <CustomTextField
            select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            className='is-[70px]'
          >
            <MenuItem value='10'>10</MenuItem>
            <MenuItem value='25'>25</MenuItem>
            <MenuItem value='50'>50</MenuItem>
          </CustomTextField>
        </div>
        <div className='flex gap-4 flex-col !items-start is-full sm:flex-row sm:is-auto sm:items-center'>
          <DebouncedInput
            value={globalFilter ?? ''}
            className='is-[250px]'
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search User'
          />
          <CustomTextField
            select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className='is-[160px]'
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value=''>All Roles</MenuItem>
            {roles.map(role => (
              <MenuItem key={role.id} value={role.name}>
                {role.name}
              </MenuItem>
            ))}
          </CustomTextField>
        </div>
      </CardContent>
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={classnames({
                          'flex items-center': header.column.getIsSorted(),
                          'cursor-pointer select-none': header.column.getCanSort()
                        })}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <i className='tabler-chevron-up text-xl' />,
                          desc: <i className='tabler-chevron-down text-xl' />
                        }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          {table.getFilteredRowModel().rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  No users found
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table
                .getRowModel()
                .rows.slice(0, table.getState().pagination.pageSize)
                .map(row => (
                  <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
            </tbody>
          )}
        </table>
      </div>
      <TablePagination
        component={() => <TablePaginationComponent table={table} />}
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => table.setPageIndex(page)}
      />
    </Card>
  )
}

export default RolesTable

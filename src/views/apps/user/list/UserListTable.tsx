'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

// Third-party Imports
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

// Type Imports
import type { ThemeColor } from '@core/types'
import type { UsersType } from '@/types/apps/userTypes'
import type { Locale } from '@configs/i18n'

// Component Imports
import AddUserDrawer from './AddUserDrawer'
import EditUserDrawer from './EditUserDrawer'
import OptionMenu from '@core/components/option-menu'
import TablePaginationComponent from '@components/TablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'
import CustomAvatar from '@core/components/mui/Avatar'

// Context Imports
import { usePermissions } from '@/contexts/PermissionContext'
import { showToast } from '@/utils/toast'

// Util Imports
import { getInitials } from '@/utils/getInitials'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type UsersTypeWithAction = UsersType & {
  action?: string
}

type UserRoleType = {
  [key: string]: { icon: string; color: string }
}

type UserStatusType = {
  [key: string]: ThemeColor
}

const Icon = styled('i')({})

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
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

const userRoleObj: UserRoleType = {
  admin: { icon: 'tabler-crown', color: 'error' },
  manager: { icon: 'tabler-briefcase', color: 'warning' },
  user: { icon: 'tabler-user', color: 'info' },
  editor: { icon: 'tabler-edit', color: 'success' },
  viewer: { icon: 'tabler-eye', color: 'primary' }
}

const userStatusObj: UserStatusType = {
  true: 'success',
  false: 'secondary'
}

const columnHelper = createColumnHelper<UsersTypeWithAction>()

const UserListTable = ({
  tableData,
  onDelete,
  onUpdate
}: {
  tableData?: UsersType[]
  onDelete: (id: number) => void
  onUpdate: (id: number, data: Partial<UsersType>) => void
}) => {
  const [roles, setRoles] = useState<Array<{ id: number; name: string }>>([])
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [editUserOpen, setEditUserOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UsersType | null>(null)
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<UsersType[]>([])
  const [filteredData, setFilteredData] = useState<UsersType[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UsersType | null>(null)

  const { lang: locale } = useParams()
  const { hasPermission } = usePermissions()

  // Check permissions
  const canCreate = hasPermission('users.create')
  const canEdit = hasPermission('users.edit') || hasPermission('users.update')
  const canDelete = hasPermission('users.delete')

  // Fetch roles
  const loadRoles = async () => {
    try {
      const token = localStorage.getItem('accessToken')

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const json = await res.json()

      if (json.success) {
        setRoles(json.roles || [])
      }
    } catch (err) {
      console.error('Failed to fetch roles:', err)
      showToast.error('Failed to load roles')
    }
  }

  // Fetch users
  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('accessToken')

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const json = await res.json()

      if (json.success) {
        setData(json.users)
        setFilteredData(json.users)
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
      showToast.error('Failed to load users')
    }
  }

  useEffect(() => {
    loadRoles()
    loadUsers()
  }, [])

  // Handle Add User button click with permission check
  const handleAddUserClick = () => {
    if (!canCreate) {
      showToast.error("You don't have permission to create users", 'Access Denied')

      return
    }

    setAddUserOpen(true)
  }

  // Delete user handler with permission check
  const handleDeleteClick = (user: UsersType) => {
    if (!canDelete) {
      showToast.error("You don't have permission to delete users", 'Access Denied')

      return
    }

    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    try {
      const token = localStorage.getItem('accessToken')

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userToDelete.id}`, {
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
      console.error('Delete error:', err)
      showToast.error('Error deleting user')
    }

    setDeleteDialogOpen(false)
    setUserToDelete(null)
  }

  // Update user handler with permission check
  const handleUpdate = async (id: number, updateData: Partial<UsersType>) => {
    if (!canEdit) {
      showToast.error("You don't have permission to update users", 'Access Denied')

      return
    }

    try {
      const token = localStorage.getItem('accessToken')

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      })

      const json = await res.json()

      if (json.success) {
        showToast.success('User updated successfully!')
        loadUsers()
      } else {
        showToast.error(json.message || 'Failed to update user')
      }
    } catch (err) {
      console.error('Update error:', err)
      showToast.error('Error updating user')
    }
  }

  // Open edit drawer with user data and permission check
  const handleEdit = (user: UsersType) => {
    if (!canEdit) {
      showToast.error("You don't have permission to edit users", 'Access Denied')

      return
    }

    setSelectedUser(user)
    setEditUserOpen(true)
  }

  const columns = useMemo<ColumnDef<UsersTypeWithAction, any>[]>(
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
          <div className='flex items-center gap-4'>
            {getAvatar({ avatar: row.original.avatar, name: row.original.name })}
            <div className='flex flex-col'>
              <Typography color='text.primary' className='font-medium'>
                {row.original.name}
              </Typography>
              <Typography variant='body2'>{row.original.email}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('phone', {
        header: 'Phone',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.phone || '-'}</Typography>
      }),
      columnHelper.accessor('roleName', {
        header: 'Role',
        cell: ({ row }) => {
          const roleName = row.original.roleName || 'user'
          const roleKey = roleName.toLowerCase()

          return (
            <div className='flex items-center gap-2'>
              <Icon
                className={userRoleObj[roleKey]?.icon || 'tabler-user'}
                sx={{ color: `var(--mui-palette-${userRoleObj[roleKey]?.color || 'primary'}-main)` }}
              />
              <Typography className='capitalize' color='text.primary'>
                {roleName}
              </Typography>
            </div>
          )
        }
      }),
      columnHelper.accessor('lastLogin', {
        header: 'Last Login',
        cell: ({ row }) => (
          <Typography color='text.primary'>
            {row.original.lastLogin
              ? new Date(row.original.lastLogin).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })
              : 'Never'}
          </Typography>
        )
      }),
      columnHelper.accessor('isActive', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={row.original.isActive ? 'Active' : 'Inactive'}
            size='small'
            color={userStatusObj[String(row.original.isActive)]}
            className='capitalize'
          />
        )
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        enableSorting: false,
        cell: ({ row }) => (
          <div className='flex items-center'>
            {canDelete && (
              <IconButton onClick={() => handleDeleteClick(row.original)}>
                <i className='tabler-trash text-textSecondary' />
              </IconButton>
            )}

            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
                ...(canEdit
                  ? [
                      {
                        text: 'Edit',
                        icon: 'tabler-edit',
                        menuItemProps: {
                          className: 'flex items-center gap-2 text-textSecondary',
                          onClick: () => handleEdit(row.original)
                        }
                      }
                    ]
                  : []),
                ...(canEdit
                  ? [
                      {
                        text: row.original.isActive ? 'Deactivate' : 'Activate',
                        icon: row.original.isActive ? 'tabler-user-off' : 'tabler-user-check',
                        menuItemProps: {
                          className: 'flex items-center gap-2 text-textSecondary',
                          onClick: () => handleUpdate(row.original.id, { isActive: !row.original.isActive })
                        }
                      }
                    ]
                  : [])
              ]}
            />
          </div>
        )
      })
    ],
    [data, filteredData, locale, canEdit, canDelete]
  )

  const table = useReactTable({
    data: filteredData as UsersType[],
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, globalFilter },
    initialState: { pagination: { pageSize: 10 } },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  const getAvatar = ({ avatar, name }: Pick<UsersType, 'avatar' | 'name'>) => {
    return avatar ? <CustomAvatar src={avatar} size={34} /> : <CustomAvatar size={34}>{getInitials(name)}</CustomAvatar>
  }

  return (
    <>
      <Card>
        <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
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

          <div className='flex flex-col sm:flex-row is-full sm:is-auto items-start sm:items-center gap-4'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Search User'
              className='is-full sm:is-auto'
            />

            <Button
              color='secondary'
              variant='tonal'
              startIcon={<i className='tabler-upload' />}
              className='is-full sm:is-auto'
            >
              Export
            </Button>

            <Button
              variant='contained'
              startIcon={<i className='tabler-plus' />}
              onClick={handleAddUserClick}
              className='is-full sm:is-auto'
            >
              Add New User
            </Button>
          </div>
        </div>

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
                    No data available
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

      {canCreate && (
        <AddUserDrawer
          open={addUserOpen}
          handleClose={() => setAddUserOpen(false)}
          reloadUsers={loadUsers}
          roles={roles}
        />
      )}

      {canEdit && (
        <EditUserDrawer
          open={editUserOpen}
          handleClose={() => {
            setEditUserOpen(false)
            setSelectedUser(null)
          }}
          reloadUsers={loadUsers}
          roles={roles}
          userData={selectedUser}
        />
      )}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete User?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete "{userToDelete?.name}"? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color='error' variant='contained' onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default UserListTable

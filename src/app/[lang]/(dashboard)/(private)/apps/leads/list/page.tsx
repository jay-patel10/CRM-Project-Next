// views/apps/leads/list/page.tsx
'use client'

import { useEffect, useState, useMemo } from 'react'

import { useParams } from 'next/navigation'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues
} from '@tanstack/react-table'

import CustomTextField from '@core/components/mui/TextField'
import AddLeadDrawer from './AddLeadDrawer'
import EditLeadDrawer from './EditLeadDrawer'
import TablePaginationComponent from '@components/TablePaginationComponent'
import TableFilters from './TableFilters'
import { usePermissions } from '@/contexts/PermissionContext'
import { showToast } from '@/utils/toast'

import tableStyles from '@core/styles/table.module.css'

const leadStatusColors: any = {
  New: 'primary',
  Contacted: 'info',
  Qualified: 'success',
  Negotiation: 'warning',
  Won: 'success',
  Lost: 'error'
}

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: any
  }
  interface FilterMeta {
    itemRank: any
  }
}

const fuzzyFilter: any = (row: any, columnId: any, value: any, addMeta: any) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

const columnHelper = createColumnHelper<any>()

const LeadsListPage = () => {
  const { hasPermission } = usePermissions()

  const [addLeadOpen, setAddLeadOpen] = useState(false)
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})

  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<any>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [leadToDelete, setLeadToDelete] = useState<any>(null)

  const { lang: locale } = useParams()

  // Check permissions
  const canCreate = hasPermission('leads.create')
  const canEdit = hasPermission('leads.edit') || hasPermission('leads.update')
  const canDelete = hasPermission('leads.delete')
  const canView = hasPermission('leads.read') || hasPermission('leads.view')

  // Load leads from backend
  const loadLeads = async () => {
    try {
      const token = localStorage.getItem('accessToken')

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const json = await res.json()

      if (json.success) {
        setData(json.leads)
        setFilteredData(json.leads)
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err)
      showToast.error('Failed to load leads')
    }
  }

  useEffect(() => {
    loadLeads()
  }, [])

  // Handle Add Lead button click with permission check
  const handleAddLeadClick = () => {
    if (!canCreate) {
      showToast.error("You don't have permission to add leads", 'Access Denied')

      return
    }

    setAddLeadOpen(true)
  }

  // Edit Lead with permission check
  const handleEditLead = (lead: any) => {
    if (!canEdit) {
      showToast.error("You don't have permission to edit leads", 'Access Denied')

      return
    }

    setSelectedLead(lead)
    setEditDrawerOpen(true)
  }

  // Delete Lead with permission check
  const handleDeleteClick = (lead: any) => {
    if (!canDelete) {
      showToast.error("You don't have permission to delete leads", 'Access Denied')

      return
    }

    setLeadToDelete(lead)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!leadToDelete) return

    try {
      const token = localStorage.getItem('accessToken')

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads/${leadToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      const json = await res.json()

      if (json.success) {
        showToast.success('Lead deleted successfully!')
        loadLeads()
      } else {
        showToast.error(json.message || 'Failed to delete lead')
      }
    } catch (err) {
      console.error('Delete error:', err)
      showToast.error('Error deleting lead')
    }

    setDeleteDialogOpen(false)
    setLeadToDelete(null)
  }

  // Columns
  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }: any) => (
          <Checkbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }: any) => (
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
        header: 'Name',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.name}
          </Typography>
        )
      }),

      columnHelper.accessor('email', {
        header: 'Email',
        cell: ({ row }) => <Typography>{row.original.email}</Typography>
      }),

      columnHelper.accessor('company', {
        header: 'Company',
        cell: ({ row }) => <Typography>{row.original.company || '-'}</Typography>
      }),

      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            label={row.original.status}
            variant='tonal'
            color={leadStatusColors[row.original.status]}
            size='small'
            className='capitalize'
          />
        )
      }),

      columnHelper.accessor('source', {
        header: 'Source',
        cell: ({ row }) => <Typography>{row.original.source || '-'}</Typography>
      }),

      columnHelper.accessor('assignedTo', {
        header: 'Assigned To',
        cell: ({ row }) => (
          <Typography color={row.original.assignedTo === 'Unassigned' ? 'text.secondary' : 'text.primary'}>
            {row.original.assignedTo}
          </Typography>
        )
      }),

      columnHelper.accessor('createdAt', {
        header: 'Created On',
        cell: ({ row }) => (
          <Typography>
            {new Date(row.original.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </Typography>
        )
      }),

      columnHelper.accessor('action', {
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            {canEdit && (
              <IconButton size='small' onClick={() => handleEditLead(row.original)}>
                <i className='tabler-edit text-textSecondary' />
              </IconButton>
            )}
            {canDelete && (
              <IconButton size='small' onClick={() => handleDeleteClick(row.original)}>
                <i className='tabler-trash text-textSecondary' />
              </IconButton>
            )}
            {!canEdit && !canDelete && (
              <Typography variant='caption' color='text.secondary'>
                No actions
              </Typography>
            )}
          </div>
        )
      })
    ],
    [data, canEdit, canDelete]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, globalFilter },
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    initialState: { pagination: { pageSize: 10 } },
    globalFilterFn: fuzzyFilter,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  return (
    <>
      <Card>
        <CardHeader title='Leads' className='pbe-4' />

        <TableFilters setData={setFilteredData} tableData={data} />

        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-bs'>
          <CustomTextField
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder='Search Leads'
            className='is-full sm:is-auto'
          />

          <div className='flex flex-col sm:flex-row gap-4'>
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
              onClick={handleAddLeadClick}
              className='is-full sm:is-auto'
            >
              Add Lead
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
                      {!header.isPlaceholder && (
                        <div
                          className={classnames({
                            'flex items-center cursor-pointer select-none': header.column.getCanSort()
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

            <tbody>
              {table.getFilteredRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className='text-center'>
                    No leads found
                  </td>
                </tr>
              ) : (
                table
                  .getRowModel()
                  .rows.slice(0, table.getState().pagination.pageSize)
                  .map(row => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  ))
              )}
            </tbody>
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
        <AddLeadDrawer open={addLeadOpen} handleClose={() => setAddLeadOpen(false)} onCreateLead={loadLeads} />
      )}

      {canEdit && (
        <EditLeadDrawer
          open={editDrawerOpen}
          handleClose={() => {
            setEditDrawerOpen(false)
            setSelectedLead(null)
          }}
          onUpdateLead={loadLeads}
          leadData={selectedLead}
        />
      )}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Lead?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete "{leadToDelete?.name}"? This action cannot be undone.</Typography>
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

export default LeadsListPage

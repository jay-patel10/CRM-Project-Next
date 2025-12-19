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
import EditMyLeadDrawer from '../list/EditLeadDrawer'
import TablePaginationComponent from '@components/TablePaginationComponent'
import MyLeadsTableFilters from './MyLeadsTableFilters'

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

const MyLeadsPage = () => {
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})

  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<any>(null)

  const { lang: locale } = useParams()

  // Load user's assigned leads only
  const loadMyLeads = async () => {
    try {
      console.log('🔍 [MyLeads] Starting loadMyLeads...')

      // Get token from localStorage
      const token = localStorage.getItem('accessToken')
      const userData = localStorage.getItem('userData')

      console.log('🔑 [MyLeads] Token exists:', !!token)
      console.log('👤 [MyLeads] User data:', userData)

      if (!token) {
        console.error('❌ [MyLeads] No token found in localStorage!')

        return
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/leads/my`

      console.log('🌐 [MyLeads] Calling API:', apiUrl)

      const res = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store' // prevent browser caching
      })

      console.log('📡 [MyLeads] Response status:', res.status)
      console.log('📡 [MyLeads] Response headers:', res.headers)

      if (!res.ok) {
        const errorText = await res.text()

        console.error('❌ [MyLeads] API error:', errorText)
        throw new Error(`API returned ${res.status}: ${errorText}`)
      }

      const json = await res.json()

      console.log('📦 [MyLeads] API response:', json)
      console.log('📊 [MyLeads] Leads count:', json.leads?.length || 0)
      console.log('📋 [MyLeads] Leads data:', json.leads)

      if (json.success) {
        setData(json.leads)
        setFilteredData(json.leads)
        console.log('✅ [MyLeads] State updated with', json.leads.length, 'leads')
      } else {
        console.error('❌ [MyLeads] API returned success=false')
      }
    } catch (err) {
      console.error('💥 [MyLeads] Failed to fetch:', err)
    }
  }

  useEffect(() => {
    console.log('🎬 [MyLeads] Component mounted, loading leads...')
    loadMyLeads()
  }, [])

  // Log state updates
  useEffect(() => {
    console.log('🔄 [MyLeads] State changed:')
    console.log('   - data length:', data.length)
    console.log('   - filteredData length:', filteredData.length)
    console.log('   - data:', data)
  }, [data, filteredData])

  const handleEditLead = (lead: any) => {
    console.log('✏️ [MyLeads] Editing lead:', lead)
    setSelectedLead(lead)
    setEditDrawerOpen(true)
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

      columnHelper.accessor('phone', {
        header: 'Phone',
        cell: ({ row }) => <Typography>{row.original.phone || '-'}</Typography>
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
          <IconButton size='small' onClick={() => handleEditLead(row.original)}>
            <i className='tabler-edit text-textSecondary' />
          </IconButton>
        )
      })
    ],
    [data]
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

  // Log table rows BEFORE render
  console.log('📊 [MyLeads] Table state:')
  console.log('   - Total rows:', table.getRowModel().rows.length)
  console.log('   - Filtered rows:', table.getFilteredRowModel().rows.length)
  console.log('   - Paginated rows:', table.getPaginationRowModel().rows.length)

  return (
    <>
      <Card>
        <CardHeader title='My Leads' className='pbe-4' />

        <MyLeadsTableFilters setData={setFilteredData} tableData={data} />

        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-bs'>
          <CustomTextField
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder='Search My Leads'
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
                    No leads assigned to you
                  </td>
                </tr>
              ) : (
                table.getPaginationRowModel().rows.map(row => {
                  console.log('🎨 [MyLeads] Rendering row:', row.original)

                  return (
                    <tr key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  )
                })
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

      <EditMyLeadDrawer
        open={editDrawerOpen}
        handleClose={() => {
          setEditDrawerOpen(false)
          setSelectedLead(null)
        }}
        onUpdateLead={loadMyLeads}
        leadData={selectedLead}
      />
    </>
  )
}

export default MyLeadsPage

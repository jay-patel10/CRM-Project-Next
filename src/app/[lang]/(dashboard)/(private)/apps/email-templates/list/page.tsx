'use client'

import { useEffect, useState, useMemo } from 'react'

import { useRouter, useParams } from 'next/navigation'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import Tooltip from '@mui/material/Tooltip'
import Alert from '@mui/material/Alert'

import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  getSortedRowModel
} from '@tanstack/react-table'

import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'
import { showToast } from '@/utils/toast'
import apiClient from '@/libs/api'

import tableStyles from '@core/styles/table.module.css'

const fuzzyFilter: any = (row: any, columnId: any, value: any, addMeta: any) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

const columnHelper = createColumnHelper<any>()

const EmailTemplatesListPage = () => {
  const router = useRouter()
  const { lang: locale } = useParams()

  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')

  const loadTemplates = async () => {
    try {
      const response = await apiClient.get('/emails/templates')

      if (response.data.success) {
        setData(response.data.templates)
      }
    } catch (err: any) {
      console.error('Failed to fetch templates:', err)
      const errorMessage = err.response?.data?.message || 'Failed to load email templates'

      showToast.error(errorMessage)
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [])

  const handleEdit = (template: any) => {
    router.push(`/${locale}/apps/email-templates/edit/${template.id}`)
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Template Name',
        cell: ({ row }) => (
          <div>
            <Typography className='font-medium' color='text.primary'>
              {row.original.name}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {row.original.slug}
            </Typography>
          </div>
        )
      }),

      columnHelper.accessor('subject', {
        header: 'Subject',
        cell: ({ row }) => <Typography className='max-w-md truncate'>{row.original.subject}</Typography>
      }),

      columnHelper.accessor('variables', {
        header: 'Variables',
        cell: ({ row }) => {
          const vars = row.original.variables || []

          return (
            <div className='flex flex-wrap gap-1'>
              {vars.length > 0 ? (
                vars
                  .slice(0, 3)
                  .map((v: string, i: number) => <Chip key={i} label={`{{${v}}}`} size='small' variant='outlined' />)
              ) : (
                <Typography variant='caption' color='text.secondary'>
                  No variables
                </Typography>
              )}
              {vars.length > 3 && <Chip label={`+${vars.length - 3}`} size='small' variant='outlined' />}
            </div>
          )
        }
      }),

      columnHelper.accessor('isActive', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            label={row.original.isActive ? 'Active' : 'Inactive'}
            variant='tonal'
            color={row.original.isActive ? 'success' : 'secondary'}
            size='small'
          />
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
            <Tooltip title='Customize Template'>
              <IconButton size='small' onClick={() => handleEdit(row.original)}>
                <i className='tabler-edit text-textSecondary' />
              </IconButton>
            </Tooltip>
          </div>
        )
      })
    ],
    [locale]
  )

  const table = useReactTable({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    initialState: { pagination: { pageSize: 10 } },
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  return (
    <Card>
      <CardHeader title='Email Templates' className='pbe-4' />

      <div className='p-6 border-bs'>
        <Alert severity='info' sx={{ mb: 3 }}>
          <Typography variant='body2'>
            Customize pre-defined email templates by changing colors, fonts, and text. You cannot create new templates
            or delete existing ones.
          </Typography>
        </Alert>

        <CustomTextField
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder='Search Templates'
          className='is-full sm:is-auto'
        />
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
                  No email templates found
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
  )
}

export default EmailTemplatesListPage

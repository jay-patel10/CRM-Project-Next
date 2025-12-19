// MyLeadsTableFilters.tsx
// Save as: src/views/apps/leads/my-leads/MyLeadsTableFilters.tsx

'use client'

import { useState, useEffect } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'

import CustomTextField from '@core/components/mui/TextField'

type LeadType = {
  id: number
  name: string
  email: string
  phone?: string
  company?: string
  statusId: number
  status: string
  source?: string
  createdAt: string
}

type Props = {
  setData: (data: LeadType[]) => void
  tableData: LeadType[]
}

const MyLeadsTableFilters = ({ setData, tableData }: Props) => {
  const [status, setStatus] = useState<string>('')
  const [source, setSource] = useState<string>('')

  useEffect(() => {
    const filteredData = tableData.filter((lead: LeadType) => {
      if (status && lead.status !== status) return false
      if (source && lead.source !== source) return false

      return true
    })

    setData(filteredData)
  }, [status, source, tableData, setData])

  const handleReset = () => {
    setStatus('')
    setSource('')
    setData(tableData)
  }

  return (
    <Card>
      <CardContent>
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center'>
          <CustomTextField
            select
            fullWidth
            value={status}
            onChange={e => setStatus(e.target.value)}
            SelectProps={{ displayEmpty: true }}
            className='sm:is-[200px]'
          >
            <MenuItem value=''>All Status</MenuItem>
            <MenuItem value='New'>New</MenuItem>
            <MenuItem value='Contacted'>Contacted</MenuItem>
            <MenuItem value='Qualified'>Qualified</MenuItem>
            <MenuItem value='Negotiation'>Negotiation</MenuItem>
            <MenuItem value='Won'>Won</MenuItem>
            <MenuItem value='Lost'>Lost</MenuItem>
          </CustomTextField>

          <CustomTextField
            select
            fullWidth
            value={source}
            onChange={e => setSource(e.target.value)}
            SelectProps={{ displayEmpty: true }}
            className='sm:is-[200px]'
          >
            <MenuItem value=''>All Sources</MenuItem>
            <MenuItem value='Website'>Website</MenuItem>
            <MenuItem value='Referral'>Referral</MenuItem>
            <MenuItem value='LinkedIn'>LinkedIn</MenuItem>
            <MenuItem value='Facebook'>Facebook</MenuItem>
            <MenuItem value='Google Ads'>Google Ads</MenuItem>
            <MenuItem value='Other'>Other</MenuItem>
          </CustomTextField>

          <Button variant='tonal' color='secondary' onClick={handleReset}>
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default MyLeadsTableFilters

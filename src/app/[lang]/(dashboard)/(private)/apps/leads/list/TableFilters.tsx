// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

const TableFilters = ({ setData, tableData }: { setData: (data: any[]) => void; tableData?: any[] }) => {
  // States
  const [status, setStatus] = useState<string>('')
  const [source, setSource] = useState<string>('')

  useEffect(() => {
    const filteredData = tableData?.filter(lead => {
      if (status && lead.status !== status) return false
      if (source && lead.source !== source) return false

      return true
    })

    setData(filteredData || [])
  }, [status, source, tableData, setData])

  return (
    <CardContent>
      <Grid container spacing={6}>
        <Grid item xs={12} sm={6}>
          <CustomTextField
            select
            fullWidth
            id='select-status'
            value={status}
            onChange={e => setStatus(e.target.value)}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value=''>Select Status</MenuItem>
            <MenuItem value='New'>New</MenuItem>
            <MenuItem value='Contacted'>Contacted</MenuItem>
            <MenuItem value='Qualified'>Qualified</MenuItem>
            <MenuItem value='Negotiation'>Negotiation</MenuItem>
            <MenuItem value='Won'>Won</MenuItem>
            <MenuItem value='Lost'>Lost</MenuItem>
          </CustomTextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <CustomTextField
            select
            fullWidth
            id='select-source'
            value={source}
            onChange={e => setSource(e.target.value)}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value=''>Select Source</MenuItem>
            <MenuItem value='Website'>Website</MenuItem>
            <MenuItem value='Referral'>Referral</MenuItem>
            <MenuItem value='Social Media'>Social Media</MenuItem>
            <MenuItem value='Email'>Email</MenuItem>
            <MenuItem value='Phone'>Phone</MenuItem>
            <MenuItem value='API'>API</MenuItem>
          </CustomTextField>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'

// Type Imports
import type { UsersType } from '@/types/apps/userTypes'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

const TableFilters = ({
  setData,
  tableData,
  roles = []
}: {
  setData: (data: UsersType[]) => void
  tableData?: UsersType[]
  roles?: Array<{ id: number; name: string }>
}) => {
  // States
  const [roleId, setRoleId] = useState<number | ''>('')
  const [isActive, setIsActive] = useState<string>('')

  useEffect(() => {
    const filteredData = tableData?.filter(user => {
      if (roleId && user.roleId !== roleId) return false
      if (isActive !== '' && String(user.isActive) !== isActive) return false

      return true
    })

    setData(filteredData || [])
  }, [roleId, isActive, tableData, setData])

  return (
    <CardContent>
      <Grid container spacing={6}>
        <Grid item xs={12} sm={6}>
          <CustomTextField
            select
            fullWidth
            id='select-role'
            value={roleId}
            onChange={e => setRoleId(e.target.value === '' ? '' : Number(e.target.value))}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value=''>All Roles</MenuItem>
            {roles.map(role => (
              <MenuItem key={role.id} value={role.id}>
                {role.name}
              </MenuItem>
            ))}
          </CustomTextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <CustomTextField
            select
            fullWidth
            id='select-status'
            value={isActive}
            onChange={e => setIsActive(e.target.value)}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value=''>All Status</MenuItem>
            <MenuItem value='true'>Active</MenuItem>
            <MenuItem value='false'>Inactive</MenuItem>
          </CustomTextField>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters

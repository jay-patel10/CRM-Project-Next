'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

// RBAC
import { PermissionGuard } from '@/components/PermissionGuard'

// Component Imports
import RoleCards from './RoleCards'
import RolesTable from './RolesTable'

const Roles = () => {
  return (
    <PermissionGuard module='Roles' action='read'>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Typography variant='h4' className='mbe-1'>
            Roles List
          </Typography>
          <Typography color='text.secondary'>
            A role provides access to predefined menus and features so that depending on the assigned role, an
            administrator can have access to what they need.
          </Typography>
        </Grid>

        {/* Role Cards Section */}
        <Grid item xs={12}>
          <RoleCards />
        </Grid>

        {/* Users with Roles Section */}
        <Grid item xs={12} className='!pbs-12'>
          <Typography variant='h4' className='mbe-1'>
            Total users with their roles
          </Typography>
          <Typography color='text.secondary'>
            Find all of your company's administrator accounts and their associated roles.
          </Typography>
        </Grid>

        {/* Roles Table Section */}
        <Grid item xs={12}>
          <RolesTable />
        </Grid>
      </Grid>
    </PermissionGuard>
  )
}

export default Roles

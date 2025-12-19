// components/PermissionDebug.tsx
// Save as: src/components/PermissionDebug.tsx
// Add this to your dashboard to see permissions

'use client'

import { useState } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'

import { usePermissions } from '@/contexts/PermissionContext'

export const PermissionDebug = () => {
  const [open, setOpen] = useState(false)
  const { user, permissions, isAdmin, isLoading } = usePermissions()

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading permissions...</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <div className='flex items-center justify-between mb-4'>
          <Typography variant='h6'>🔐 Permission Debug</Typography>
          <IconButton onClick={() => setOpen(!open)}>
            <i className={open ? 'tabler-chevron-up' : 'tabler-chevron-down'} />
          </IconButton>
        </div>

        <div className='flex flex-col gap-2 mb-4'>
          <div>
            <strong>User:</strong> {user?.name || 'Not logged in'}
          </div>
          <div>
            <strong>Email:</strong> {user?.email || 'N/A'}
          </div>
          <div>
            <strong>Role:</strong> {user?.role || 'N/A'}
          </div>
          <div>
            <strong>Role ID:</strong> {user?.roleId}
          </div>
          <div>
            <Chip
              label={isAdmin ? 'Admin (Full Access)' : 'Regular User'}
              color={isAdmin ? 'success' : 'default'}
              size='small'
            />
          </div>
        </div>

        <Collapse in={open}>
          <Typography variant='subtitle2' className='mb-2'>
            📋 All Permissions:
          </Typography>
          <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded'>
            <pre className='text-xs overflow-auto'>{JSON.stringify(permissions, null, 2)}</pre>
          </div>

          <Typography variant='subtitle2' className='mt-4 mb-2'>
            🧪 Test Permissions:
          </Typography>
          <div className='flex flex-col gap-2'>
            {['Leads', 'Users', 'Roles'].map(module => (
              <div key={module} className='border rounded p-3'>
                <Typography variant='body2' className='font-semibold mb-2'>
                  {module}
                </Typography>
                <div className='flex flex-wrap gap-2'>
                  {['view', 'create', 'edit', 'delete'].map(action => {
                    const has = permissions?.[module]?.[action] === true

                    return (
                      <Chip
                        key={action}
                        label={action}
                        size='small'
                        color={has ? 'success' : 'default'}
                        variant={has ? 'filled' : 'outlined'}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <Button
            variant='outlined'
            size='small'
            className='mt-4'
            onClick={() => {
              console.log('=== PERMISSION DEBUG ===')
              console.log('User:', user)
              console.log('Permissions:', permissions)
              console.log('Is Admin:', isAdmin)
              console.log('localStorage userData:', localStorage.getItem('userData'))
            }}
          >
            Log to Console
          </Button>
        </Collapse>
      </CardContent>
    </Card>
  )
}

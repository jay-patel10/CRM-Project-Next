// RoleCards.tsx
// Save as: src/views/apps/roles/RoleCards.tsx

'use client'

import { useState, useEffect } from 'react'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'

import AddRoleDrawer from './AddRoleDrawer'
import EditRoleDrawer from './EditRoleDrawer'
import { showToast } from '@/utils/toast'
import apiClient from '@/libs/api'

type Role = {
  id: number
  name: string
  description?: string
  permissions: any
  isActive: boolean
  userCount?: number
  users?: Array<{ id: number; name: string; email: string }>
}

const RoleCards = () => {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [addDrawerOpen, setAddDrawerOpen] = useState(false)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  useEffect(() => {
    loadRoles()
  }, [])

  const loadRoles = async () => {
    try {
      setLoading(true)
      console.log('🔍 [RoleCards] Loading roles...')

      const response = await apiClient.get('/roles')

      console.log('📡 [RoleCards] API response:', response.data)

      if (response.data.success && Array.isArray(response.data.roles)) {
        console.log('✅ [RoleCards] Loaded', response.data.roles.length, 'roles')
        setRoles(response.data.roles)
      } else {
        console.warn('⚠️ [RoleCards] No roles in response')
        setRoles([])
      }
    } catch (err: any) {
      console.error('❌ [RoleCards] Failed to fetch roles:', err)
      const errorMessage = err.response?.data?.message || 'Failed to load roles'

      showToast.error(errorMessage)
      setRoles([])
    } finally {
      setLoading(false)
    }
  }

  const handleEditRole = (role: Role) => {
    console.log('✏️ [RoleCards] Editing role:', role)
    setSelectedRole(role)
    setEditDrawerOpen(true)
  }

  const handleDeleteRole = async (roleId: number, roleName: string) => {
    if (!confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      return
    }

    try {
      const response = await apiClient.delete(`/roles/${roleId}`)

      if (response.data.success) {
        showToast.success('Role deleted successfully!')
        loadRoles()
      } else {
        showToast.error(response.data.message || 'Failed to delete role')
      }
    } catch (err: any) {
      console.error('❌ [RoleCards] Delete error:', err)
      const errorMessage = err.response?.data?.message || 'Error deleting role'

      showToast.error(errorMessage)
    }
  }

  const countPermissions = (permissions: any): number => {
    if (!permissions || typeof permissions !== 'object') return 0

    let count = 0

    Object.values(permissions).forEach((modulePerms: any) => {
      if (modulePerms && typeof modulePerms === 'object') {
        Object.values(modulePerms).forEach(val => {
          if (val === true) count++
        })
      }
    })

    return count
  }

  if (loading) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Typography>Loading roles...</Typography>
        </Grid>
      </Grid>
    )
  }

  return (
    <>
      <Grid container spacing={6}>
        {roles.map(role => (
          <Grid item xs={12} sm={6} lg={4} key={role.id}>
            <Card>
              <CardContent className='flex flex-col gap-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Chip label={`${role.userCount || 0} users`} size='small' variant='tonal' color='primary' />
                    <Chip
                      label={role.isActive ? 'Active' : 'Inactive'}
                      size='small'
                      variant='tonal'
                      color={role.isActive ? 'success' : 'secondary'}
                    />
                  </div>
                  <IconButton
                    size='small'
                    onClick={() => handleDeleteRole(role.id, role.name)}
                    disabled={role.id === 1} // Don't allow deleting Admin role
                  >
                    <i className='tabler-trash text-textSecondary' />
                  </IconButton>
                </div>

                <div>
                  <Typography variant='h5' className='font-semibold'>
                    {role.name}
                  </Typography>
                  <Typography variant='body2' color='text.secondary' className='mbs-1'>
                    {role.description || 'No description provided'}
                  </Typography>
                </div>

                {role.users && role.users.length > 0 && (
                  <div className='flex items-center gap-2'>
                    <AvatarGroup max={4} className='pull-up'>
                      {role.users.slice(0, 4).map(user => (
                        <Avatar key={user.id} alt={user.name} className='cursor-pointer' sx={{ width: 32, height: 32 }}>
                          {user.name[0]}
                        </Avatar>
                      ))}
                    </AvatarGroup>
                  </div>
                )}

                <Button
                  variant='tonal'
                  size='small'
                  startIcon={<i className='tabler-edit' />}
                  onClick={() => handleEditRole(role)}
                  fullWidth
                >
                  Edit Role
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Add New Role Card */}
        <Grid item xs={12} sm={6} lg={4}>
          <Card
            className='cursor-pointer'
            sx={{
              border: '2px dashed',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover'
              }
            }}
            onClick={() => setAddDrawerOpen(true)}
          >
            <CardContent className='flex flex-col items-center justify-center gap-4' style={{ minHeight: 200 }}>
              <Avatar
                variant='rounded'
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: 'primary.main'
                }}
              >
                <i className='tabler-plus text-[32px]' />
              </Avatar>
              <Typography variant='h6'>Add New Role</Typography>
              <Typography variant='body2' color='text.secondary' textAlign='center'>
                Create a new role with custom permissions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <AddRoleDrawer open={addDrawerOpen} handleClose={() => setAddDrawerOpen(false)} reloadRoles={loadRoles} />

      <EditRoleDrawer
        open={editDrawerOpen}
        handleClose={() => {
          setEditDrawerOpen(false)
          setSelectedRole(null)
        }}
        reloadRoles={loadRoles}
        roleData={selectedRole}
      />
    </>
  )
}

export default RoleCards

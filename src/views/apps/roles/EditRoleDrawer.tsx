// EditRoleDrawer.tsx
'use client'

import { useState, useEffect } from 'react'

import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Checkbox from '@mui/material/Checkbox'
import FormGroup from '@mui/material/FormGroup'
import Alert from '@mui/material/Alert'

import { useForm, Controller } from 'react-hook-form'

import CustomTextField from '@core/components/mui/TextField'
import { showToast } from '@/utils/toast'
import apiClient from '@/libs/api'

type EditRoleInput = {
  name: string
  description: string
}

type PermissionModule = {
  name: string
  label: string
  permissions: Array<{ key: string; label: string }>
}

const permissionModules: PermissionModule[] = [
  {
    name: 'Users',
    label: 'User Management',
    permissions: [
      { key: 'create', label: 'Create' },
      { key: 'view', label: 'View' },
      { key: 'edit', label: 'Edit' },
      { key: 'delete', label: 'Delete' }
    ]
  },
  {
    name: 'Leads',
    label: 'Lead Management',
    permissions: [
      { key: 'create', label: 'Create' },
      { key: 'view', label: 'View' },
      { key: 'edit', label: 'Edit' },
      { key: 'delete', label: 'Delete' },
      { key: 'assign', label: 'Assign' }
    ]
  },
  {
    name: 'Roles',
    label: 'Role Management',
    permissions: [
      { key: 'create', label: 'Create' },
      { key: 'view', label: 'View' },
      { key: 'edit', label: 'Edit' },
      { key: 'delete', label: 'Delete' }
    ]
  },
  {
    name: 'Reports',
    label: 'Reports',
    permissions: [
      { key: 'view', label: 'View' },
      { key: 'export', label: 'Export' }
    ]
  }
]

const EditRoleDrawer = ({ open, handleClose, reloadRoles, roleData }: any) => {
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [fetchingRole, setFetchingRole] = useState(false)
  const [permissions, setPermissions] = useState<any>({})
  const [allPermissions, setAllPermissions] = useState<any[]>([])
  const [validationError, setValidationError] = useState<string>('')

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm<EditRoleInput>({
    defaultValues: { name: '', description: '' }
  })

  // ✅ Fetch complete role data with permissions from backend
  useEffect(() => {
    const fetchRoleDetails = async () => {
      if (!roleData?.id || !open) return

      try {
        setFetchingRole(true)
        console.log('🔍 [EditRoleDrawer] Fetching role details for ID:', roleData.id)

        // ✅ USE apiClient instead of fetch
        const roleRes = await apiClient.get(`/roles/${roleData.id}`)
        const roleJson = roleRes.data

        console.log('📦 [EditRoleDrawer] Role response:', roleJson)

        // ✅ USE apiClient instead of fetch
        const permRes = await apiClient.get('/roles/permissions')
        const permJson = permRes.data

        console.log('📋 [EditRoleDrawer] All permissions response:', permJson)

        if (roleJson?.success === true && roleJson?.role?.id) {
          const role = roleJson.role

          // Set form values
          reset({
            name: role.name || '',
            description: role.description || ''
          })

          setIsActive(role.isActive ?? true)

          // ✅ Store ALL available permissions
          if (permJson?.success && Array.isArray(permJson.data)) {
            setAllPermissions(permJson.data)
            console.log('💾 [EditRoleDrawer] Stored all available permissions:', permJson.data)
          } else if (permJson?.permissions && Array.isArray(permJson.permissions)) {
            setAllPermissions(permJson.permissions)
            console.log('💾 [EditRoleDrawer] Stored all available permissions:', permJson.permissions)
          } else {
            console.warn('⚠️ [EditRoleDrawer] No permissions data found in response')
          }

          // ✅ Convert permissions to nested object structure for UI
          const loadedPermissions: any = {}

          console.log('🔐 [EditRoleDrawer] Raw permissions from backend:', role.permissions)

          if (Array.isArray(role.permissions) && role.permissions.length > 0) {
            role.permissions.forEach((perm: any) => {
              console.log('  → Processing permission:', perm)

              let permKey = ''

              if (typeof perm === 'object' && perm.key) {
                permKey = perm.key
              } else if (typeof perm === 'string') {
                permKey = perm
              }

              console.log('  → Permission key:', permKey)

              if (permKey && (permKey.includes(':') || permKey.includes('.'))) {
                const separator = permKey.includes(':') ? ':' : '.'
                const [module, action] = permKey.split(separator)

                const moduleName =
                  module.toLowerCase() === 'users'
                    ? 'Users'
                    : module.toLowerCase() === 'leads'
                      ? 'Leads'
                      : module.toLowerCase() === 'roles'
                        ? 'Roles'
                        : module.toLowerCase() === 'reports'
                          ? 'Reports'
                          : module

                // Map backend action names to frontend action names
                let frontendAction: string

                switch (action) {
                  case 'read':
                    frontendAction = 'view'
                    break
                  case 'update':
                    frontendAction = 'edit'
                    break
                  case 'create':
                  case 'delete':
                  case 'assign':
                  case 'export':
                    frontendAction = action
                    break
                  default:
                    return
                }

                if (!loadedPermissions[moduleName]) {
                  loadedPermissions[moduleName] = {}
                }

                loadedPermissions[moduleName][frontendAction] = true
                console.log(`  ✓ Set ${moduleName}.${frontendAction} = true (from ${action})`)
              }
            })
          }

          console.log('✅ [EditRoleDrawer] Final permissions object:', loadedPermissions)
          setPermissions(loadedPermissions)
        } else {
          console.error('❌ [EditRoleDrawer] Role fetch failed:', roleJson)
          showToast.error(roleJson?.message || 'Failed to load role details')
        }
      } catch (err: any) {
        console.error('❌ [EditRoleDrawer] Error fetching role:', err)
        showToast.error(err.response?.data?.message || 'Error loading role details')
      } finally {
        setFetchingRole(false)
      }
    }

    fetchRoleDetails()
  }, [roleData?.id, open, reset])

  const handlePermissionChange = (module: string, permission: string, checked: boolean) => {
    setPermissions((prev: any) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [permission]: checked
      }
    }))
  }

  // Select all permissions for a module
  const handleSelectAllModule = (module: string, checked: boolean) => {
    const modulePerms = permissionModules.find(m => m.name === module)

    if (!modulePerms) return

    const allPerms: any = {}

    modulePerms.permissions.forEach(perm => {
      allPerms[perm.key] = checked
    })

    setPermissions((prev: any) => ({
      ...prev,
      [module]: allPerms
    }))
  }

  const validatePermissions = (): boolean => {
    const hasAnyPermission = Object.values(permissions).some((modulePerms: any) =>
      Object.values(modulePerms || {}).some(val => val === true)
    )

    if (!hasAnyPermission) {
      setValidationError('Please select at least one permission')

      return false
    }

    setValidationError('')

    return true
  }

  // ✅ Convert nested permissions object to array of permission IDs
  const getPermissionIds = (): number[] => {
    const selectedIds: number[] = []

    console.log('🔄 [EditRoleDrawer] Converting permissions to IDs...')
    console.log('  → Current permissions state:', permissions)
    console.log('  → Available permissions with IDs:', allPermissions)

    Object.keys(permissions).forEach(module => {
      Object.keys(permissions[module] || {}).forEach(action => {
        if (permissions[module][action] === true) {
          // Map frontend actions back to backend actions
          let backendAction = action

          if (action === 'view') backendAction = 'read'
          if (action === 'edit') backendAction = 'update'

          // Try both formats: "users:create" and "users.create"
          const permKeyColon = `${module.toLowerCase()}:${backendAction}`
          const permKeyDot = `${module.toLowerCase()}.${backendAction}`

          // Find permission ID from stored permissions
          const perm = allPermissions.find((p: any) => p.key === permKeyColon || p.key === permKeyDot)

          console.log(`  → Looking for ${permKeyColon} or ${permKeyDot}, found:`, perm)

          if (perm && perm.id) {
            selectedIds.push(perm.id)
          } else {
            console.warn(`  ⚠️ Permission not found: ${permKeyColon} / ${permKeyDot}`)
          }
        }
      })
    })

    console.log('🔑 [EditRoleDrawer] Selected permission IDs:', selectedIds)

    return selectedIds
  }

  const handleFormSubmit = async (formData: EditRoleInput) => {
    console.log('🚀 [EditRoleDrawer] Form submitted!')

    if (!roleData) {
      console.error('❌ No roleData')
      showToast.error('No role data found')

      return
    }

    // Validate permissions
    if (!validatePermissions()) {
      console.error('❌ Validation failed')
      showToast.error('Please select at least one permission')

      return
    }

    try {
      setLoading(true)

      // ✅ Get permission IDs from stored permissions
      const permissionIds = getPermissionIds()

      console.log('🔢 [EditRoleDrawer] Permission IDs to send:', permissionIds)

      if (permissionIds.length === 0) {
        console.error('❌ No permission IDs found')
        showToast.error('No valid permissions selected')
        setLoading(false)

        return
      }

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        permissionIds,
        isActive
      }

      console.log('📤 [EditRoleDrawer] Sending PUT request')
      console.log('📤 [EditRoleDrawer] Payload:', payload)

      // ✅ USE apiClient instead of fetch
      const response = await apiClient.put(`/roles/${roleData.id}`, payload)
      const json = response.data

      console.log('📥 [EditRoleDrawer] Response data:', json)

      if (json.success === false) {
        showToast.error(json.message || 'Failed to update role')
        setLoading(false)

        return
      }

      showToast.success('Role updated successfully!')

      console.log('🔄 [EditRoleDrawer] Reloading roles...')
      await reloadRoles()

      console.log('✅ [EditRoleDrawer] Reset and close')
      handleReset()
    } catch (err: any) {
      console.error('❌ [EditRoleDrawer] Update Role Error:', err)
      showToast.error(err.response?.data?.message || 'Error updating role. Please try again.')
      setLoading(false)
    }
  }

  const handleReset = () => {
    reset()
    setIsActive(true)
    setPermissions({})
    setAllPermissions([])
    setValidationError('')
    handleClose()
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 500 } } }}
    >
      <div className='flex items-center justify-between p-6 pb-4'>
        <div>
          <Typography variant='h5'>Edit Role</Typography>
          {roleData && (
            <Typography variant='caption' color='text.secondary'>
              Role ID: #{roleData.id}
            </Typography>
          )}
        </div>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl' />
        </IconButton>
      </div>

      <Divider />

      {fetchingRole ? (
        <div className='flex items-center justify-center p-6'>
          <Typography>Loading role details...</Typography>
        </div>
      ) : (
        <form onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col gap-6 p-6'>
          <Controller
            name='name'
            control={control}
            rules={{
              required: 'Role name is required',
              minLength: { value: 3, message: 'Role name must be at least 3 characters' },
              maxLength: { value: 50, message: 'Role name must not exceed 50 characters' }
            }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                label='Role Name *'
                placeholder='Enter role name'
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
                onChange={e => {
                  field.onChange(e)
                  setValidationError('')
                }}
              />
            )}
          />

          <Controller
            name='description'
            control={control}
            rules={{
              maxLength: { value: 200, message: 'Description must not exceed 200 characters' }
            }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                label='Description'
                placeholder='Describe the role responsibilities'
                fullWidth
                multiline
                rows={3}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            )}
          />

          <Divider />

          <div>
            <Typography variant='h6' className='mb-4'>
              Module Permissions
            </Typography>
            {validationError && (
              <Alert severity='error' className='mb-4'>
                {validationError}
              </Alert>
            )}
          </div>

          {permissionModules.map(module => {
            const allSelected = module.permissions.every(perm => permissions[module.name]?.[perm.key] === true)
            const someSelected = module.permissions.some(perm => permissions[module.name]?.[perm.key] === true)

            return (
              <div key={module.name} className='border rounded-lg p-4'>
                <div className='flex items-center justify-between mb-3'>
                  <Typography variant='subtitle1' className='font-semibold'>
                    {module.label}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={allSelected}
                        indeterminate={someSelected && !allSelected}
                        onChange={e => handleSelectAllModule(module.name, e.target.checked)}
                      />
                    }
                    label='Select All'
                  />
                </div>

                <FormGroup row className='gap-2'>
                  {module.permissions.map(perm => (
                    <FormControlLabel
                      key={perm.key}
                      control={
                        <Checkbox
                          checked={permissions[module.name]?.[perm.key] || false}
                          onChange={e => handlePermissionChange(module.name, perm.key, e.target.checked)}
                        />
                      }
                      label={perm.label}
                    />
                  ))}
                </FormGroup>
              </div>
            )
          })}

          <FormControlLabel
            control={<Switch checked={isActive} onChange={e => setIsActive(e.target.checked)} />}
            label='Active Status'
          />

          <div className='flex items-center gap-4'>
            <Button variant='contained' type='submit' disabled={loading} fullWidth>
              {loading ? 'Updating...' : 'Update Role'}
            </Button>
            <Button variant='tonal' color='error' onClick={handleReset} fullWidth>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </Drawer>
  )
}

export default EditRoleDrawer

// EditRoleDrawer.tsx
// Save as: src/views/apps/roles/EditRoleDrawer.tsx

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
import Chip from '@mui/material/Chip'

import { useForm, Controller } from 'react-hook-form'

import CustomTextField from '@core/components/mui/TextField'
import { showToast } from '@/utils/toast'

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
  const [permissions, setPermissions] = useState<any>({})
  const [validationError, setValidationError] = useState<string>('')

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm<EditRoleInput>({
    defaultValues: { name: '', description: '' }
  })

  // ✅ Load existing role data when drawer opens
  useEffect(() => {
    if (roleData && open) {
      console.log('📝 [EditRoleDrawer] Loading role data:', roleData)

      reset({
        name: roleData.name || '',
        description: roleData.description || ''
      })

      setIsActive(roleData.isActive ?? true)

      // ✅ Ensure permissions is always an object
      const loadedPermissions = roleData.permissions || {}

      console.log('🔐 [EditRoleDrawer] Loaded permissions:', loadedPermissions)
      setPermissions(loadedPermissions)
    }
  }, [roleData, open, reset])

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
      Object.values(modulePerms).some(val => val === true)
    )

    if (!hasAnyPermission) {
      setValidationError('Please select at least one permission')

      return false
    }

    setValidationError('')

    return true
  }

  const handleFormSubmit = async (formData: EditRoleInput) => {
    if (!roleData) {
      showToast.error('No role data found')

      return
    }

    // Validate permissions
    if (!validatePermissions()) {
      showToast.error('Please select at least one permission')

      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        permissions,
        isActive
      }

      console.log('📤 [EditRoleDrawer] Updating role:', payload)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/roles/${roleData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const json = await res.json()

      if (json.success === false) {
        showToast.error(json.message || 'Failed to update role')

        return
      }

      showToast.success('Role updated successfully!')
      await reloadRoles()
      handleReset()
    } catch (err: any) {
      console.error('❌ [EditRoleDrawer] Update Role Error:', err)
      showToast.error('Error updating role. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    reset()
    setIsActive(true)
    setPermissions({})
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
    </Drawer>
  )
}

export default EditRoleDrawer

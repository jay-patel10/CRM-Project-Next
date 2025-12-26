// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'

import apiClient from '@/libs/api'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import { showToast } from '@/utils/toast'

// Types
import type { UsersType } from '@/types/apps/userTypes'

type Props = {
  open: boolean
  handleClose: () => void
  reloadUsers: () => void
  roles: Array<{ id: number; name: string }>
  userData: UsersType | null
}

type EditUserInput = {
  name: string
  email: string
  phone?: string
  roleId: number
  isActive: boolean
}

const EditUserDrawer = ({ open, handleClose, reloadUsers, roles, userData }: Props) => {
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm<EditUserInput>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      roleId: undefined,
      isActive: true
    }
  })

  useEffect(() => {
    if (userData) {
      reset({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        roleId: userData.roleId || undefined,
        isActive: userData.isActive ?? true
      })
      setIsActive(userData.isActive ?? true)
    }
  }, [userData, reset])

  const handleFormSubmit = async (formData: EditUserInput) => {
    if (!userData) return

    try {
      setLoading(true)

      const res = await apiClient.put(`/users/${userData.id}`, {
        ...formData,
        roleId: Number(formData.roleId),
        isActive
      })

      if (res.data?.success === false) {
        showToast.error(res.data.message || 'Failed to update user')

        return
      }

      showToast.success('User updated successfully!')

      await reloadUsers()
      handleReset()
    } catch (err: any) {
      console.error('Update User Error:', err)
      showToast.error('Error updating user')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    reset()
    setIsActive(true)
    handleClose()
  }

  // Get current role name
  const currentRole = roles.find(r => r.id === userData?.roleId)

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between p-6 pb-4'>
        <div>
          <Typography variant='h5'>Edit User</Typography>
          {userData && (
            <Typography variant='caption' color='text.secondary'>
              User ID: #{userData.id}
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
          rules={{ required: 'Name is required' }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              label='Full Name'
              placeholder='John Doe'
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          )}
        />

        <Controller
          name='email'
          control={control}
          rules={{
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Invalid email format'
            }
          }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              type='email'
              label='Email'
              placeholder='johndoe@gmail.com'
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          )}
        />

        <Controller
          name='phone'
          control={control}
          rules={{
            pattern: {
              value: /^[0-9]{10}$/,
              message: 'Phone must be exactly 10 digits'
            }
          }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              label='Phone'
              placeholder='9876543210'
              error={!!errors.phone}
              helperText={errors.phone?.message}
            />
          )}
        />
        <Controller
          name='roleId'
          control={control}
          rules={{ required: 'Role is required' }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              select
              fullWidth
              label='Select Role'
              error={!!errors.roleId}
              helperText={errors.roleId?.message}
              value={field.value ?? ''}
              SelectProps={{
                displayEmpty: true,
                renderValue: selected => {
                  if (!selected) {
                    return <span style={{ color: '#9e9e9e' }}>Select Role</span>
                  }

                  const selectedRole = roles.find(role => role.id === selected)

                  return selectedRole?.name || ''
                }
              }}
            >
              {/* ONLY roles in dropdown */}
              {roles.map(role => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name}
                </MenuItem>
              ))}
            </CustomTextField>
          )}
        />

        <FormControlLabel
          control={<Switch checked={isActive} onChange={e => setIsActive(e.target.checked)} />}
          label='Active Status'
        />

        <div className='flex items-center gap-4'>
          <Button variant='contained' type='submit' disabled={loading}>
            {loading ? 'Updating...' : 'Update'}
          </Button>
          <Button variant='tonal' color='error' onClick={handleReset}>
            Cancel
          </Button>
        </div>
      </form>
    </Drawer>
  )
}

export default EditUserDrawer

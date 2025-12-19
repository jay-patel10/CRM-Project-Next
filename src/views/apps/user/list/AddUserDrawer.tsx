// React Imports
import { useState } from 'react'

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
import axios from 'axios'
import { useForm, Controller } from 'react-hook-form'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import { showToast } from '@/utils/toast'

// Types
import type { CreateUserInput } from '@/types/apps/userTypes'

type Props = {
  open: boolean
  handleClose: () => void
  reloadUsers: () => void
  roles: Array<{ id: number; name: string }>
}

const AddUserDrawer = ({ open, handleClose, reloadUsers, roles }: Props) => {
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm<CreateUserInput>({
    defaultValues: {
      email: '',
      name: '',
      password: '',
      phone: '',
      roleId: undefined,
      isActive: true
    }
  })

  const handleFormSubmit = async (formData: CreateUserInput) => {
    try {
      setLoading(true)
      formData.roleId = Number(formData.roleId)

      const token = localStorage.getItem('accessToken')

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/users`,
        { ...formData, isActive },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (res.data?.success === false) {
        showToast.error(res.data?.message || 'Something went wrong')
        return
      }

      showToast.success('User created successfully!')

      if (typeof reloadUsers === 'function') {
        await reloadUsers()
      }

      handleReset()
    } catch (err: any) {
      console.error('Create User Error:', err.response?.data)

      if (err.message && err.message.includes('is not a function')) {
        showToast.warning('User created in database, but page refresh failed. Please refresh manually.')
      } else {
        showToast.error(err.response?.data?.message || 'Error creating user')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    reset()
    setIsActive(true)
    handleClose()
  }

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
        <Typography variant='h5'>Add New User</Typography>
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
          name='password'
          control={control}
          rules={{
            required: 'Password is required',
            minLength: { value: 6, message: 'Minimum 6 characters' }
          }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              type='password'
              fullWidth
              label='Password'
              placeholder='••••••••'
              error={!!errors.password}
              helperText={errors.password?.message}
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
            >
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
            {loading ? 'Saving...' : 'Submit'}
          </Button>
          <Button variant='tonal' color='error' onClick={handleReset}>
            Cancel
          </Button>
        </div>
      </form>
    </Drawer>
  )
}

export default AddUserDrawer

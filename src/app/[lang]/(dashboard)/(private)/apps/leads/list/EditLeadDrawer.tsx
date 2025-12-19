// EditLeadDrawer.tsx
// Save as: src/views/apps/leads/list/EditLeadDrawer.tsx

'use client'

import { useEffect, useState } from 'react'

import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'

import { useForm, Controller } from 'react-hook-form'

import CustomTextField from '@core/components/mui/TextField'
import { showToast } from '@/utils/toast'

type LeadFormType = {
  name: string
  email: string
  statusId: number
  phone?: string
  company?: string
  source?: string
  assignedToId?: number | ''
  notes?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  apiSource?: string
}

type LeadType = {
  id: number
  name: string
  email: string
  phone?: string
  company?: string
  statusId: number
  status?: string
  source?: string
  assignedToId?: number
  assignedTo?: string
  notes?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  apiSource?: string
  createdAt?: string
}

type Props = {
  open: boolean
  handleClose: () => void
  onUpdateLead: () => void
  leadData: LeadType | null
}

const EditLeadDrawer = ({ open, handleClose, onUpdateLead, leadData }: Props) => {
  const [users, setUsers] = useState<Array<{ id: number; name: string; email: string }>>([])
  const [loading, setLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm<LeadFormType>({
    defaultValues: {
      name: '',
      email: '',
      statusId: 1,
      phone: '',
      company: '',
      source: '',
      assignedToId: '',
      notes: '',
      utmSource: '',
      utmMedium: '',
      utmCampaign: '',
      apiSource: ''
    }
  })

  // Load users whenever drawer opens
  useEffect(() => {
    if (open) {
      loadUsers()
    }
  }, [open])

  const loadUsers = async () => {
    try {
      setLoadingUsers(true)
      console.log('🔍 [EditLeadDrawer] Loading users...')

      const token = localStorage.getItem('accessToken')

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const json = await res.json()

      console.log('📦 [EditLeadDrawer] Users loaded:', json.users?.length || 0)

      if (json.success && Array.isArray(json.users)) {
        setUsers(json.users)
      } else {
        setUsers([])
      }
    } catch (err) {
      console.error('❌ [EditLeadDrawer] Failed to fetch users:', err)
      showToast.error('Failed to load users')
      setUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  // Populate form when leadData changes
  useEffect(() => {
    if (leadData && open) {
      console.log('📝 [EditLeadDrawer] Populating form with:', leadData)

      reset({
        name: leadData.name || '',
        email: leadData.email || '',
        statusId: leadData.statusId || 1,
        phone: leadData.phone || '',
        company: leadData.company || '',
        source: leadData.source || '',

        // ✅ IMPORTANT: Convert null/undefined to empty string for proper display
        assignedToId: leadData.assignedToId || '',
        notes: leadData.notes || '',
        utmSource: leadData.utmSource || '',
        utmMedium: leadData.utmMedium || '',
        utmCampaign: leadData.utmCampaign || '',
        apiSource: leadData.apiSource || ''
      })
    }
  }, [leadData, open, reset])

  const onSubmit = async (data: LeadFormType) => {
    if (!leadData) return

    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')

      // Convert empty string back to null for API
      const payload = {
        ...data,
        assignedToId: data.assignedToId === '' || data.assignedToId === undefined ? null : Number(data.assignedToId),
        name: data.name.trim(),
        email: data.email.trim(),
        company: data.company?.trim() || null,
        phone: data.phone?.trim() || null,
        notes: data.notes?.trim() || null
      }

      console.log('📤 [EditLeadDrawer] Updating lead:', payload)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads/${leadData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const json = await res.json()

      if (json.success === false) {
        showToast.error(json.message || 'Failed to update lead')

        return
      }

      showToast.success('Lead updated successfully!')
      onUpdateLead()
      handleReset()
    } catch (err: any) {
      console.error('❌ [EditLeadDrawer] Update Lead Error:', err)
      showToast.error('Error updating lead. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    reset()
    handleClose()
  }

  // Show current assignment info
  const currentAssignment = leadData?.assignedTo || 'Unassigned'

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={handleReset}
      variant='temporary'
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 320, sm: 450 } } }}
    >
      <div className='flex items-center justify-between plb-5 pli-6'>
        <div>
          <Typography variant='h5'>Edit Lead</Typography>
          {leadData && (
            <Typography variant='caption' color='text.secondary'>
              Lead ID: #{leadData.id}
            </Typography>
          )}
        </div>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl text-textPrimary' />
        </IconButton>
      </div>

      <Divider />

      {/* Current Assignment Info */}
      {leadData && (
        <div className='p-6 pb-0'>
          <div className='flex items-center gap-2 mb-4'>
            <Typography variant='body2' color='text.secondary'>
              Currently assigned to:
            </Typography>
            <Chip
              label={currentAssignment}
              size='small'
              color={leadData.assignedToId ? 'primary' : 'default'}
              variant='tonal'
            />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6 p-6'>
        <Controller
          name='name'
          control={control}
          rules={{
            required: 'Lead name is required',
            minLength: { value: 2, message: 'Name must be at least 2 characters' },
            maxLength: { value: 100, message: 'Name must not exceed 100 characters' }
          }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              label='Lead Name *'
              placeholder='John Doe'
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
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              type='email'
              label='Email *'
              placeholder='john@example.com'
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
              helperText={errors.phone?.message || 'Enter 10-digit mobile number'}
            />
          )}
        />

        <Controller
          name='company'
          control={control}
          rules={{
            maxLength: { value: 100, message: 'Company name must not exceed 100 characters' }
          }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              label='Company'
              placeholder='ABC Pvt Ltd'
              error={!!errors.company}
              helperText={errors.company?.message}
            />
          )}
        />

        <Controller
          name='statusId'
          control={control}
          rules={{ required: 'Status is required' }}
          render={({ field }) => (
            <CustomTextField {...field} select fullWidth label='Lead Status *'>
              <MenuItem value={1}>New</MenuItem>
              <MenuItem value={2}>Contacted</MenuItem>
              <MenuItem value={3}>Qualified</MenuItem>
              <MenuItem value={4}>Negotiation</MenuItem>
              <MenuItem value={5}>Won</MenuItem>
              <MenuItem value={6}>Lost</MenuItem>
            </CustomTextField>
          )}
        />

        <Controller
          name='source'
          control={control}
          render={({ field }) => (
            <CustomTextField {...field} select fullWidth label='Lead Source'>
              <MenuItem value=''>None</MenuItem>
              <MenuItem value='Website'>Website</MenuItem>
              <MenuItem value='Referral'>Referral</MenuItem>
              <MenuItem value='LinkedIn'>LinkedIn</MenuItem>
              <MenuItem value='Facebook'>Facebook</MenuItem>
              <MenuItem value='Google Ads'>Google Ads</MenuItem>
              <MenuItem value='Cold Call'>Cold Call</MenuItem>
              <MenuItem value='Email Campaign'>Email Campaign</MenuItem>
              <MenuItem value='Other'>Other</MenuItem>
            </CustomTextField>
          )}
        />

        <Controller
          name='assignedToId'
          control={control}
          render={({ field }) => (
            <CustomTextField
              {...field}
              select
              fullWidth
              label='Assign To'
              disabled={loadingUsers}
              // ✅ Convert value properly for display
              value={field.value === null ? '' : field.value}
              onChange={e => {
                // ✅ Convert empty string to empty for form state
                field.onChange(e.target.value === '' ? '' : Number(e.target.value))
              }}
            >
              <MenuItem value=''>{loadingUsers ? 'Loading users...' : 'Unassigned'}</MenuItem>
              {users.map(user => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </MenuItem>
              ))}
            </CustomTextField>
          )}
        />

        <Controller
          name='notes'
          control={control}
          rules={{
            maxLength: { value: 500, message: 'Notes must not exceed 500 characters' }
          }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              multiline
              minRows={3}
              label='Notes'
              placeholder='Add any additional information...'
              error={!!errors.notes}
              helperText={errors.notes?.message}
            />
          )}
        />

        <Divider />

        <Typography variant='subtitle2' color='text.secondary'>
          UTM Parameters (Optional)
        </Typography>

        <Controller
          name='utmSource'
          control={control}
          render={({ field }) => (
            <CustomTextField {...field} fullWidth label='UTM Source' placeholder='google, facebook, newsletter' />
          )}
        />

        <Controller
          name='utmMedium'
          control={control}
          render={({ field }) => (
            <CustomTextField {...field} fullWidth label='UTM Medium' placeholder='cpc, email, social' />
          )}
        />

        <Controller
          name='utmCampaign'
          control={control}
          render={({ field }) => (
            <CustomTextField {...field} fullWidth label='UTM Campaign' placeholder='summer_sale, product_launch' />
          )}
        />

        <Controller
          name='apiSource'
          control={control}
          render={({ field }) => (
            <CustomTextField {...field} fullWidth label='API Source' placeholder='zapier, webhook, integration' />
          )}
        />

        <div className='flex items-center gap-4'>
          <Button variant='contained' type='submit' disabled={loading || loadingUsers} fullWidth>
            {loading ? 'Updating...' : 'Update Lead'}
          </Button>
          <Button variant='tonal' color='error' onClick={handleReset} fullWidth>
            Cancel
          </Button>
        </div>
      </form>
    </Drawer>
  )
}

export default EditLeadDrawer

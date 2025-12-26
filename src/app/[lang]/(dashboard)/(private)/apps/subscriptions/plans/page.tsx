// ==========================================
// FILE: src/app/[lang]/(dashboard)/(private)/apps/subscriptions/plans/page.tsx
// ==========================================
'use client'

import { useState, useEffect } from 'react'

import { useParams } from 'next/navigation'

import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert
} from '@mui/material'

import { usePermissions } from '@/contexts/PermissionContext'

interface SubscriptionPlan {
  id: number
  name: string
  description: string
  price: number
  currency: string
  billingCycle: 'monthly' | 'yearly' | 'lifetime'
  features: string[]
  isActive: boolean
  stripePriceId: string
  createdAt: string
}

const SubscriptionPlansPage = () => {
  const params = useParams()
  const { lang } = params as { lang: string }
  const { isAdmin } = usePermissions()

  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    currency: 'INR',
    billingCycle: 'monthly' as 'monthly' | 'yearly' | 'lifetime',
    features: [] as string[],
    isActive: true
  })

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/plans`)
      const data = await res.json()

      if (data.success) {
        setPlans(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch plans:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (plan?: SubscriptionPlan) => {
    if (plan) {
      setEditMode(true)
      setSelectedPlan(plan)
      setFormData({
        name: plan.name,
        description: plan.description,
        price: plan.price,
        currency: plan.currency,
        billingCycle: plan.billingCycle,
        features: plan.features,
        isActive: plan.isActive
      })
    } else {
      setEditMode(false)
      setSelectedPlan(null)
      setFormData({
        name: '',
        description: '',
        price: 0,
        currency: 'INR',
        billingCycle: 'monthly',
        features: [],
        isActive: true
      })
    }

    setDialogOpen(true)
    setError('')
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedPlan(null)
    setError('')
  }

  const handleSavePlan = async () => {
    try {
      const token = localStorage.getItem('accessToken')

      const url = editMode
        ? `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/plans/${selectedPlan?.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/plans`

      const res = await fetch(url, {
        method: editMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (data.success) {
        await fetchPlans()
        handleCloseDialog()
      } else {
        setError(data.message || 'Failed to save plan')
      }
    } catch (err) {
      setError('An error occurred')
      console.error(err)
    }
  }

  const handleDeletePlan = async (planId: number) => {
    if (!confirm('Are you sure you want to delete this plan?')) return

    try {
      const token = localStorage.getItem('accessToken')

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/plans/${planId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await res.json()

      if (data.success) {
        await fetchPlans()
      } else {
        alert(data.message || 'Failed to delete plan')
      }
    } catch (err) {
      console.error(err)
      alert('An error occurred')
    }
  }

  const getBillingLabel = (cycle: string) => {
    switch (cycle) {
      case 'monthly':
        return '/month'
      case 'yearly':
        return '/year'
      case 'lifetime':
        return 'one-time'
      default:
        return ''
    }
  }

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <Typography>Loading plans...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
        <Box>
          <Typography variant='h4' fontWeight={600}>
            Subscription Plans
          </Typography>
          <Typography variant='body2' color='text.secondary' mt={1}>
            Manage your pricing tiers and features
          </Typography>
        </Box>
        {isAdmin && (
          <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={() => handleOpenDialog()}>
            Create Plan
          </Button>
        )}
      </Box>

      {/* Plans Grid */}
      <Grid container spacing={4}>
        {plans.map(plan => (
          <Grid item xs={12} md={6} lg={4} key={plan.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid',
                borderColor: 'divider',
                position: 'relative'
              }}
            >
              {!plan.isActive && (
                <Chip label='Inactive' size='small' color='error' sx={{ position: 'absolute', top: 16, right: 16 }} />
              )}

              <CardContent sx={{ flexGrow: 1, pt: 4 }}>
                <Typography variant='h5' fontWeight={600} gutterBottom>
                  {plan.name}
                </Typography>

                <Box display='flex' alignItems='baseline' mb={2}>
                  <Typography variant='h3' fontWeight={700}>
                    {plan.currency} {plan.price}
                  </Typography>
                  <Typography variant='body2' color='text.secondary' ml={1}>
                    {getBillingLabel(plan.billingCycle)}
                  </Typography>
                </Box>

                <Typography variant='body2' color='text.secondary' mb={3}>
                  {plan.description}
                </Typography>

                {plan.features && plan.features.length > 0 && (
                  <Box>
                    <Typography variant='subtitle2' fontWeight={600} mb={1.5}>
                      Features:
                    </Typography>
                    {plan.features.map((feature, idx) => (
                      <Box key={idx} display='flex' alignItems='center' mb={1}>
                        <i className='tabler-check' style={{ marginRight: 8, color: 'success.main' }} />
                        <Typography variant='body2'>{feature}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>

              {isAdmin && (
                <Box p={2} display='flex' gap={1} borderTop='1px solid' borderColor='divider'>
                  <Button
                    fullWidth
                    variant='outlined'
                    startIcon={<i className='tabler-edit' />}
                    onClick={() => handleOpenDialog(plan)}
                  >
                    Edit
                  </Button>
                  <Button
                    fullWidth
                    variant='outlined'
                    color='error'
                    startIcon={<i className='tabler-trash' />}
                    onClick={() => handleDeletePlan(plan.id)}
                  >
                    Delete
                  </Button>
                </Box>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth='sm' fullWidth>
        <DialogTitle>{editMode ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label='Plan Name'
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            margin='normal'
          />

          <TextField
            fullWidth
            label='Description'
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            margin='normal'
            multiline
            rows={3}
          />

          <TextField
            fullWidth
            type='number'
            label='Price'
            value={formData.price}
            onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            margin='normal'
          />

          <FormControl fullWidth margin='normal'>
            <InputLabel>Currency</InputLabel>
            <Select
              value={formData.currency}
              label='Currency'
              onChange={e => setFormData({ ...formData, currency: e.target.value })}
            >
              <MenuItem value='INR'>INR</MenuItem>
              <MenuItem value='USD'>USD</MenuItem>
              <MenuItem value='EUR'>EUR</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin='normal'>
            <InputLabel>Billing Cycle</InputLabel>
            <Select
              value={formData.billingCycle}
              label='Billing Cycle'
              onChange={e =>
                setFormData({ ...formData, billingCycle: e.target.value as 'monthly' | 'yearly' | 'lifetime' })
              }
            >
              <MenuItem value='monthly'>Monthly</MenuItem>
              <MenuItem value='yearly'>Yearly</MenuItem>
              <MenuItem value='lifetime'>Lifetime</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label='Features (comma separated)'
            value={formData.features.join(', ')}
            onChange={e => setFormData({ ...formData, features: e.target.value.split(',').map(f => f.trim()) })}
            margin='normal'
            multiline
            rows={3}
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
              />
            }
            label='Active'
            sx={{ mt: 2 }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant='contained' onClick={handleSavePlan}>
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SubscriptionPlansPage

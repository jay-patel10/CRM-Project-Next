// ==========================================
// FILE: src/app/[lang]/(dashboard)/(private)/apps/subscriptions/subscribers/page.tsx
// ==========================================
'use client'

import { useState, useEffect } from 'react'

import { useParams } from 'next/navigation'

import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Switch,
  Divider
} from '@mui/material'

import { showToast } from '@/utils/toast'
import apiClient from '@/libs/api'

interface SubscriberData {
  id: number
  userId: number
  planId: number
  status: string
  startDate: string
  endDate: string
  autoRenew: boolean
  createdAt: string
  updatedAt: string
  user: {
    id: number
    email: string
    fullName: string
  }
  plan: {
    id: number
    name: string
    price: number
    currency: string
    billingCycle: string
  }
}

const AdminSubscribersPage = () => {
  const params = useParams()
  const { lang } = params as { lang: string }

  const [subscribers, setSubscribers] = useState<SubscriberData[]>([])
  const [filteredSubscribers, setFilteredSubscribers] = useState<SubscriberData[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubscriber, setSelectedSubscriber] = useState<SubscriberData | null>(null)
  const [detailsDialog, setDetailsDialog] = useState(false)
  const [plans, setPlans] = useState<any[]>([])

  // Cancel Confirmation Dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [subscriberToCancel, setSubscriberToCancel] = useState<SubscriberData | null>(null)
  const [cancelLoading, setCancelLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterSubscribers()
  }, [subscribers, statusFilter, planFilter, searchQuery])

  const fetchData = async () => {
    try {
      setLoading(true)
      console.log('🔄 [Admin] Loading subscribers...')

      // Fetch all subscribers
      const subResponse = await apiClient.get('/subscriptions/all-subscriptions')

      if (subResponse.data.success) {
        console.log('✅ [Admin] Loaded', subResponse.data.data.length, 'subscribers')
        setSubscribers(subResponse.data.data)
      } else {
        showToast.error(subResponse.data.message || 'Failed to load subscribers')
      }

      // Fetch plans for filter
      const plansResponse = await apiClient.get('/subscriptions/plans')

      if (plansResponse.data.success) {
        console.log('✅ [Admin] Loaded', plansResponse.data.data.length, 'plans')
        setPlans(plansResponse.data.data)
      }
    } catch (err: any) {
      console.error('❌ [Admin] Failed to fetch subscribers:', err)
      const errorMessage = err.response?.data?.message || 'Failed to load subscribers data'

      showToast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const filterSubscribers = () => {
    let filtered = [...subscribers]

    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter)
    }

    if (planFilter !== 'all') {
      filtered = filtered.filter(sub => sub.planId === parseInt(planFilter))
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()

      filtered = filtered.filter(
        sub =>
          sub.user.fullName.toLowerCase().includes(query) ||
          sub.user.email.toLowerCase().includes(query) ||
          sub.plan.name.toLowerCase().includes(query)
      )
    }

    setFilteredSubscribers(filtered)
  }

  const handleViewDetails = (subscriber: SubscriberData) => {
    setSelectedSubscriber(subscriber)
    setDetailsDialog(true)
  }

  const handleToggleAutoRenew = async (subscriptionId: number, currentAutoRenew: boolean, subscriberName: string) => {
    try {
      const newAutoRenew = !currentAutoRenew

      console.log('🔄 [Admin] Toggling auto-renew for:', subscriberName, 'to:', newAutoRenew)

      const response = await apiClient.put('/subscriptions/admin/toggle-auto-renew', {
        subscriptionId,
        autoRenew: newAutoRenew
      })

      if (response.data.success) {
        showToast.success(`Auto-renewal ${newAutoRenew ? 'enabled' : 'disabled'} for ${subscriberName}`)
        console.log('✅ [Admin] Auto-renew updated')
        await fetchData()
      } else {
        showToast.error(response.data.message || 'Failed to update auto-renewal')
      }
    } catch (err: any) {
      console.error('❌ [Admin] Toggle auto-renew error:', err)
      const errorMessage = err.response?.data?.message || 'An error occurred'

      showToast.error(errorMessage)
    }
  }

  const handleCancelClick = (subscriber: SubscriberData) => {
    setSubscriberToCancel(subscriber)
    setCancelDialogOpen(true)
  }

  const handleCancelConfirm = async () => {
    if (!subscriberToCancel) return

    try {
      setCancelLoading(true)
      console.log('🔄 [Admin] Cancelling subscription:', subscriberToCancel.id)

      const response = await apiClient.delete(`/subscriptions/admin/subscriptions/${subscriberToCancel.id}`)

      if (response.data.success) {
        showToast.success(`Subscription cancelled for ${subscriberToCancel.user.fullName}`)
        console.log('✅ [Admin] Subscription cancelled')
        setCancelDialogOpen(false)
        setDetailsDialog(false)
        await fetchData()
      } else {
        showToast.error(response.data.message || 'Failed to cancel subscription')
      }
    } catch (err: any) {
      console.error('❌ [Admin] Cancel error:', err)
      const errorMessage = err.response?.data?.message || 'An error occurred'

      showToast.error(errorMessage)
    } finally {
      setCancelLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'pending':
        return 'warning'
      case 'cancelled':
        return 'error'
      case 'expired':
        return 'default'
      default:
        return 'default'
    }
  }

  const calculateStats = () => {
    const total = subscribers.length
    const active = subscribers.filter(s => s.status === 'active').length
    const pending = subscribers.filter(s => s.status === 'pending').length
    const cancelled = subscribers.filter(s => s.status === 'cancelled').length

    const totalRevenue = subscribers
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + parseFloat(s.plan.price.toString()), 0)

    return { total, active, pending, cancelled, totalRevenue }
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant='h4' fontWeight={600}>
          Manage Subscribers
        </Typography>
        <Typography variant='body2' color='text.secondary' mt={1}>
          View and manage all subscription accounts
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Total Subscribers
              </Typography>
              <Typography variant='h4' fontWeight={700}>
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Active
              </Typography>
              <Typography variant='h4' fontWeight={700} color='success.main'>
                {stats.active}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Pending
              </Typography>
              <Typography variant='h4' fontWeight={700} color='warning.main'>
                {stats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Monthly Revenue
              </Typography>
              <Typography variant='h4' fontWeight={700}>
                ₹{stats.totalRevenue.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size='small'
                placeholder='Search by name or email...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-search' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size='small'>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label='Status' onChange={e => setStatusFilter(e.target.value)}>
                  <MenuItem value='all'>All Statuses</MenuItem>
                  <MenuItem value='active'>Active</MenuItem>
                  <MenuItem value='pending'>Pending</MenuItem>
                  <MenuItem value='cancelled'>Cancelled</MenuItem>
                  <MenuItem value='expired'>Expired</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size='small'>
                <InputLabel>Plan</InputLabel>
                <Select value={planFilter} label='Plan' onChange={e => setPlanFilter(e.target.value)}>
                  <MenuItem value='all'>All Plans</MenuItem>
                  {plans.map(plan => (
                    <MenuItem key={plan.id} value={plan.id.toString()}>
                      {plan.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Subscribers Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant='subtitle2' fontWeight={600}>
                    Subscriber
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='subtitle2' fontWeight={600}>
                    Plan
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='subtitle2' fontWeight={600}>
                    Price
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='subtitle2' fontWeight={600}>
                    Status
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='subtitle2' fontWeight={600}>
                    Auto-Renew
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='subtitle2' fontWeight={600}>
                    Start Date
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='subtitle2' fontWeight={600}>
                    End Date
                  </Typography>
                </TableCell>
                <TableCell align='center'>
                  <Typography variant='subtitle2' fontWeight={600}>
                    Actions
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubscribers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align='center'>
                    <Box py={4}>
                      <Typography variant='body2' color='text.secondary'>
                        No subscribers found
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubscribers.map(subscriber => (
                  <TableRow key={subscriber.id} hover>
                    <TableCell>
                      <Typography variant='body2' fontWeight={500}>
                        {subscriber.user.fullName}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {subscriber.user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{subscriber.plan.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' fontWeight={500}>
                        {subscriber.plan.currency} {subscriber.plan.price}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        /{subscriber.plan.billingCycle}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={subscriber.status} color={getStatusColor(subscriber.status)} size='small' />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={subscriber.autoRenew}
                        onChange={() =>
                          handleToggleAutoRenew(subscriber.id, subscriber.autoRenew, subscriber.user.fullName)
                        }
                        size='small'
                        disabled={subscriber.status !== 'active'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{new Date(subscriber.startDate).toLocaleDateString()}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{new Date(subscriber.endDate).toLocaleDateString()}</Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <IconButton size='small' onClick={() => handleViewDetails(subscriber)}>
                        <i className='tabler-eye' />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => !cancelLoading && setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Subscription?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel the subscription for <strong>{subscriberToCancel?.user.fullName}</strong>?
          </Typography>
          <Typography variant='body2' color='text.secondary' mt={2}>
            <strong>Plan:</strong> {subscriberToCancel?.plan.name}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            <strong>End Date:</strong>{' '}
            {subscriberToCancel ? new Date(subscriberToCancel.endDate).toLocaleDateString() : ''}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} disabled={cancelLoading}>
            Keep Active
          </Button>
          <Button color='error' variant='contained' onClick={handleCancelConfirm} disabled={cancelLoading}>
            {cancelLoading ? 'Cancelling...' : 'Cancel Subscription'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle>
          <Typography variant='h5' fontWeight={600}>
            Subscription Details
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedSubscriber && (
            <Box>
              <Box mb={3}>
                <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                  Subscriber Information
                </Typography>
                <Typography variant='body1' fontWeight={600}>
                  {selectedSubscriber.user.fullName}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {selectedSubscriber.user.email}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box mb={3}>
                <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                  Plan Details
                </Typography>
                <Typography variant='body1' fontWeight={600}>
                  {selectedSubscriber.plan.name}
                </Typography>
                <Typography variant='body2'>
                  {selectedSubscriber.plan.currency} {selectedSubscriber.plan.price}/
                  {selectedSubscriber.plan.billingCycle}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                    Status
                  </Typography>
                  <Chip
                    label={selectedSubscriber.status}
                    color={getStatusColor(selectedSubscriber.status)}
                    size='small'
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                    Auto-Renew
                  </Typography>
                  <Typography variant='body2'>{selectedSubscriber.autoRenew ? 'Enabled' : 'Disabled'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                    Start Date
                  </Typography>
                  <Typography variant='body2'>{new Date(selectedSubscriber.startDate).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                    End Date
                  </Typography>
                  <Typography variant='body2'>{new Date(selectedSubscriber.endDate).toLocaleDateString()}</Typography>
                </Grid>
              </Grid>

              {selectedSubscriber.status === 'active' && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Button
                    variant='outlined'
                    color='error'
                    fullWidth
                    onClick={() => handleCancelClick(selectedSubscriber)}
                  >
                    Cancel Subscription
                  </Button>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminSubscribersPage

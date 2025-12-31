// ==========================================
// FILE: src/app/[lang]/(dashboard)/(private)/apps/subscriptions/payments/page.tsx
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
  Alert
} from '@mui/material'

import apiClient from '@/libs/api'

interface Payment {
  id: number
  userId: number
  amount: number
  currency: string
  gateway: string
  gatewayTransactionId: string
  status: string
  createdAt: string
  subscription?: {
    id: number
    plan: {
      name: string
    }
  }
  user?: {
    id: number
    email: string
    fullName: string
  }
}

const PaymentsPage = () => {
  const params = useParams()
  const { lang } = params as { lang: string }

  // Temporary: Get userId (in production, from auth context)
  const [userId] = useState<number>(1) // Replace with actual user ID
  const [isAdmin] = useState<boolean>(false) // Set to true for admin users

  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [gatewayFilter, setGatewayFilter] = useState('all')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPayments()
  }, [statusFilter, gatewayFilter])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      setError('')

      const endpoint = isAdmin ? '/subscriptions/payments' : '/subscriptions/my-payments'

      const response = await apiClient.get(endpoint, {
        params: {
          ...(isAdmin ? {} : { userId }),
          ...(statusFilter !== 'all' && { status: statusFilter }),
          ...(gatewayFilter !== 'all' && { gateway: gatewayFilter })
        }
      })

      if (response.data.success) {
        setPayments(response.data.data)
      } else {
        setError(response.data.message || 'Failed to fetch payments')
      }
    } catch (err: any) {
      console.error('❌ Failed to fetch payments:', err)
      setError(err.response?.data?.message || 'Failed to load payment history')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success'
      case 'pending':
        return 'warning'
      case 'failed':
        return 'error'
      case 'refunded':
        return 'info'
      default:
        return 'default'
    }
  }

  const calculateTotalRevenue = () => {
    return payments
      .filter(p => p.status === 'success')
      .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0)
      .toFixed(2)
  }

  const calculateSuccessRate = () => {
    if (payments.length === 0) return '0'
    const successCount = payments.filter(p => p.status === 'success').length

    return ((successCount / payments.length) * 100).toFixed(1)
  }

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
          Payment History
        </Typography>
        <Typography variant='body2' color='text.secondary' mt={1}>
          {isAdmin ? 'View all customer payments' : 'Track your subscription payments'}
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity='error' sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Total Payments
              </Typography>
              <Typography variant='h4' fontWeight={700}>
                {payments.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Successful
              </Typography>
              <Typography variant='h4' fontWeight={700} color='success.main'>
                {payments.filter(p => p.status === 'success').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Success Rate
              </Typography>
              <Typography variant='h4' fontWeight={700}>
                {calculateSuccessRate()}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant='h4' fontWeight={700}>
                ₹{calculateTotalRevenue()}
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
              <FormControl fullWidth size='small'>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label='Status' onChange={e => setStatusFilter(e.target.value)}>
                  <MenuItem value='all'>All Statuses</MenuItem>
                  <MenuItem value='success'>Success</MenuItem>
                  <MenuItem value='pending'>Pending</MenuItem>
                  <MenuItem value='failed'>Failed</MenuItem>
                  <MenuItem value='refunded'>Refunded</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size='small'>
                <InputLabel>Gateway</InputLabel>
                <Select value={gatewayFilter} label='Gateway' onChange={e => setGatewayFilter(e.target.value)}>
                  <MenuItem value='all'>All Gateways</MenuItem>
                  <MenuItem value='stripe'>Stripe</MenuItem>
                  <MenuItem value='greenpay'>GreenPay</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant='subtitle2' fontWeight={600}>
                    ID
                  </Typography>
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <Typography variant='subtitle2' fontWeight={600}>
                      Customer
                    </Typography>
                  </TableCell>
                )}
                <TableCell>
                  <Typography variant='subtitle2' fontWeight={600}>
                    Plan
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='subtitle2' fontWeight={600}>
                    Amount
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='subtitle2' fontWeight={600}>
                    Gateway
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='subtitle2' fontWeight={600}>
                    Transaction ID
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='subtitle2' fontWeight={600}>
                    Status
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='subtitle2' fontWeight={600}>
                    Date
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 8 : 7} align='center'>
                    <Box py={4}>
                      <Typography variant='body2' color='text.secondary'>
                        No payments found
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                payments.map(payment => (
                  <TableRow key={payment.id} hover>
                    <TableCell>
                      <Typography variant='body2' fontWeight={500}>
                        #{payment.id}
                      </Typography>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Typography variant='body2'>{payment.user?.fullName || 'N/A'}</Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {payment.user?.email || 'N/A'}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell>
                      <Typography variant='body2'>{payment.subscription?.plan?.name || 'N/A'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' fontWeight={500}>
                        {payment.currency} {parseFloat(payment.amount.toString()).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={payment.gateway.toUpperCase()} size='small' variant='outlined' />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant='body2'
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          maxWidth: '150px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {payment.gatewayTransactionId || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={payment.status.toUpperCase()} color={getStatusColor(payment.status)} size='small' />
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{new Date(payment.createdAt).toLocaleDateString()}</Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {new Date(payment.createdAt).toLocaleTimeString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  )
}

export default PaymentsPage

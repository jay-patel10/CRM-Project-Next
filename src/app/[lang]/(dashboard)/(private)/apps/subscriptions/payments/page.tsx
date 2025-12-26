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
  CircularProgress
} from '@mui/material'

import { usePermissions } from '@/contexts/PermissionContext'

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
  const { isAdmin } = usePermissions()

  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [gatewayFilter, setGatewayFilter] = useState('all')

  useEffect(() => {
    fetchPayments()
  }, [statusFilter, gatewayFilter])

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const endpoint = isAdmin ? '/subscriptions/payments' : '/subscriptions/my-payments'

      const params = new URLSearchParams()

      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (gatewayFilter !== 'all') params.append('gateway', gatewayFilter)

      const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}?${params.toString()}`

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = await res.json()

      if (data.success) {
        setPayments(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err)
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
                Failed
              </Typography>
              <Typography variant='h4' fontWeight={700} color='error.main'>
                {payments.filter(p => p.status === 'failed').length}
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
                <TableCell>ID</TableCell>
                {isAdmin && <TableCell>Customer</TableCell>}
                <TableCell>Plan</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Gateway</TableCell>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 8 : 7} align='center'>
                    <Typography variant='body2' color='text.secondary' py={4}>
                      No payments found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                payments.map(payment => (
                  <TableRow key={payment.id}>
                    <TableCell>#{payment.id}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Typography variant='body2'>{payment.user?.fullName}</Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {payment.user?.email}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell>{payment.subscription?.plan?.name || 'N/A'}</TableCell>
                    <TableCell>
                      {payment.currency} {parseFloat(payment.amount.toString()).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Chip label={payment.gateway.toUpperCase()} size='small' variant='outlined' />
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {payment.gatewayTransactionId || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={payment.status} color={getStatusColor(payment.status)} size='small' />
                    </TableCell>
                    <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
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

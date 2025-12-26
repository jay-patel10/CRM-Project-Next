// ==========================================
// FILE: src/app/[lang]/(dashboard)/(private)/apps/subscriptions/list/page.tsx
// ==========================================
'use client'

import { useState, useEffect } from 'react'

import { useParams, useRouter } from 'next/navigation'

import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface SubscriptionPlan {
  id: number
  name: string
  description: string
  price: number
  currency: string
  billingCycle: string
  features: string[]
}

interface Subscription {
  id: number
  status: string
  startDate: string
  endDate: string
  autoRenew: boolean
  plan: SubscriptionPlan
}

const CheckoutForm = ({ clientSecret, onSuccess }: { clientSecret: string; onSuccess: () => void }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError('')

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) return

    const { error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement
      }
    })

    if (confirmError) {
      setError(confirmError.message || 'Payment failed')
      setLoading(false)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Box mb={3}>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4'
                }
              },
              invalid: {
                color: '#9e2146'
              }
            }
          }}
        />
      </Box>

      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button type='submit' variant='contained' fullWidth disabled={!stripe || loading}>
        {loading ? <CircularProgress size={24} /> : 'Complete Payment'}
      </Button>
    </form>
  )
}

const UserSubscriptionPage = () => {
  const params = useParams()
  const router = useRouter()
  const { lang } = params as { lang: string }

  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [checkoutDialog, setCheckoutDialog] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)
  const [clientSecret, setClientSecret] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken')

      // Fetch current subscription
      const subRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/my-subscription`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const subData = await subRes.json()

      if (subData.success && subData.data) {
        setCurrentSubscription(subData.data)
      }

      // Fetch available plans
      const plansRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/plans`)
      const plansData = await plansRes.json()

      if (plansData.success) {
        setPlans(plansData.data)
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (planId: number) => {
    try {
      setError('')
      const token = localStorage.getItem('accessToken')

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ planId })
      })

      const data = await res.json()

      if (data.success) {
        setClientSecret(data.data.clientSecret)
        setSelectedPlanId(planId)
        setCheckoutDialog(true)
      } else {
        setError(data.message || 'Failed to create subscription')
      }
    } catch (err) {
      console.error(err)
      setError('An error occurred')
    }
  }

  const handlePaymentSuccess = async () => {
    setCheckoutDialog(false)
    await fetchData()
    alert('Subscription activated successfully!')
  }

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return
    if (!confirm('Are you sure you want to cancel your subscription?')) return

    try {
      const token = localStorage.getItem('accessToken')

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/subscriptions/${currentSubscription.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      const data = await res.json()

      if (data.success) {
        await fetchData()
        alert('Subscription cancelled successfully')
      } else {
        alert(data.message || 'Failed to cancel subscription')
      }
    } catch (err) {
      console.error(err)
      alert('An error occurred')
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
          My Subscription
        </Typography>
        <Typography variant='body2' color='text.secondary' mt={1}>
          Manage your subscription and billing
        </Typography>
      </Box>

      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Current Subscription */}
      {currentSubscription && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box display='flex' justifyContent='space-between' alignItems='start' mb={2}>
              <Box>
                <Typography variant='h6' fontWeight={600}>
                  Current Plan: {currentSubscription.plan.name}
                </Typography>
                <Typography variant='body2' color='text.secondary' mt={0.5}>
                  {currentSubscription.plan.currency} {currentSubscription.plan.price}/
                  {currentSubscription.plan.billingCycle}
                </Typography>
              </Box>
              <Chip label={currentSubscription.status} color={getStatusColor(currentSubscription.status)} />
            </Box>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant='body2' color='text.secondary'>
                  Start Date
                </Typography>
                <Typography variant='body1'>{new Date(currentSubscription.startDate).toLocaleDateString()}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant='body2' color='text.secondary'>
                  End Date
                </Typography>
                <Typography variant='body1'>{new Date(currentSubscription.endDate).toLocaleDateString()}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant='body2' color='text.secondary'>
                  Auto Renew
                </Typography>
                <Typography variant='body1'>{currentSubscription.autoRenew ? 'Yes' : 'No'}</Typography>
              </Grid>
            </Grid>

            {currentSubscription.status === 'active' && (
              <Box mt={3}>
                <Button variant='outlined' color='error' onClick={handleCancelSubscription}>
                  Cancel Subscription
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      {!currentSubscription && (
        <>
          <Typography variant='h5' fontWeight={600} mb={3}>
            Choose Your Plan
          </Typography>
          <Grid container spacing={3}>
            {plans.map(plan => (
              <Grid item xs={12} md={6} lg={4} key={plan.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant='h6' fontWeight={600} gutterBottom>
                      {plan.name}
                    </Typography>

                    <Box display='flex' alignItems='baseline' mb={2}>
                      <Typography variant='h4' fontWeight={700}>
                        {plan.currency} {plan.price}
                      </Typography>
                      <Typography variant='body2' color='text.secondary' ml={1}>
                        /{plan.billingCycle}
                      </Typography>
                    </Box>

                    <Typography variant='body2' color='text.secondary' mb={2}>
                      {plan.description}
                    </Typography>

                    {plan.features && plan.features.length > 0 && (
                      <Box>
                        {plan.features.map((feature, idx) => (
                          <Box key={idx} display='flex' alignItems='center' mb={1}>
                            <i className='tabler-check' style={{ marginRight: 8, color: '#22c55e' }} />
                            <Typography variant='body2'>{feature}</Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </CardContent>

                  <Box p={2} borderTop='1px solid' borderColor='divider'>
                    <Button variant='contained' fullWidth onClick={() => handleSubscribe(plan.id)}>
                      Subscribe Now
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Checkout Dialog */}
      <Dialog open={checkoutDialog} onClose={() => setCheckoutDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Complete Payment</DialogTitle>
        <DialogContent>
          {clientSecret && (
            <Elements stripe={stripePromise}>
              <CheckoutForm clientSecret={clientSecret} onSuccess={handlePaymentSuccess} />
            </Elements>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default UserSubscriptionPage

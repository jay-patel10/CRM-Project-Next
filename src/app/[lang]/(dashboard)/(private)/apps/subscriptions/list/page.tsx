// ==========================================
// FILE: src/app/[lang]/(dashboard)/(private)/apps/subscriptions/list/page.tsx
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

import { showToast } from '@/utils/toast'
import apiClient from '@/libs/api'

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

// ========== CHECKOUT FORM ==========
const CheckoutForm = ({
  clientSecret,
  subscriptionId,
  paymentIntentId,
  userId,
  onSuccess,
  onError
}: {
  clientSecret: string
  subscriptionId: number
  paymentIntentId: string
  userId: number
  onSuccess: () => void
  onError: (error: string) => void
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) return

    try {
      console.log('🔄 [Checkout] Confirming payment with Stripe...')

      const { error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement
        }
      })

      if (confirmError) {
        showToast.error(confirmError.message || 'Payment failed')
        setLoading(false)
        onError(confirmError.message || 'Payment failed')

        return
      }

      console.log('✅ [Checkout] Payment confirmed with Stripe')

      // Confirm with backend
      const response = await apiClient.post('/subscriptions/confirm-payment', {
        subscriptionId,
        paymentIntentId,
        userId
      })

      if (response.data.success) {
        console.log('✅ [Checkout] Payment confirmed with backend')
        showToast.success('Subscription activated successfully! 🎉')
        onSuccess()
      } else {
        showToast.error(response.data.message || 'Failed to confirm payment')
        setLoading(false)
        onError(response.data.message || 'Failed to confirm payment')
      }
    } catch (err: any) {
      console.error('❌ [Checkout] Payment error:', err)
      const errorMessage = err.response?.data?.message || 'An error occurred during payment'

      showToast.error(errorMessage)
      setLoading(false)
      onError(errorMessage)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Box mb={3}>
        <Typography variant='body2' color='text.secondary' mb={2}>
          Enter your card details:
        </Typography>
        <Box
          sx={{
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'background.paper'
          }}
        >
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
      </Box>

      <Box
        sx={{
          p: 2,
          bgcolor: 'info.lighter',
          borderRadius: 1,
          mb: 3
        }}
      >
        <Typography variant='body2' fontWeight={600} mb={1}>
          Test Card Details:
        </Typography>
        <Typography variant='body2'>
          Card: <strong>4242 4242 4242 4242</strong>
        </Typography>
        <Typography variant='body2'>
          Expiry: <strong>Any future date (e.g., 12/34)</strong>
        </Typography>
        <Typography variant='body2'>
          CVC: <strong>Any 3 digits (e.g., 123)</strong>
        </Typography>
      </Box>

      <Button type='submit' variant='contained' fullWidth disabled={!stripe || loading} size='large'>
        {loading ? (
          <>
            <CircularProgress size={20} sx={{ mr: 1 }} color='inherit' /> Processing...
          </>
        ) : (
          'Complete Payment'
        )}
      </Button>
    </form>
  )
}

// ========== MAIN COMPONENT ==========
const UserSubscriptionPage = () => {
  const params = useParams()
  const { lang } = params as { lang: string }

  const [userId, setUserId] = useState<number | null>(null)
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [checkoutDialog, setCheckoutDialog] = useState(false)
  const [clientSecret, setClientSecret] = useState('')
  const [subscriptionId, setSubscriptionId] = useState<number | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState('')
  const [autoRenewLoading, setAutoRenewLoading] = useState(false)

  // Cancel Confirmation Dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)

  useEffect(() => {
    const testUserId = 1 // Replace with actual user ID from auth

    setUserId(testUserId)
    fetchData(testUserId)
  }, [])

  const fetchData = async (uid: number) => {
    try {
      setLoading(true)
      console.log('🔄 [Subscription] Loading data for user:', uid)

      // Fetch current subscription
      const subResponse = await apiClient.get(`/subscriptions/my-subscription?userId=${uid}`)

      if (subResponse.data.success && subResponse.data.data) {
        console.log('✅ [Subscription] Current subscription loaded')
        setCurrentSubscription(subResponse.data.data)
      } else {
        console.log('ℹ️ [Subscription] No active subscription')
        setCurrentSubscription(null)
      }

      // Fetch available plans
      const plansResponse = await apiClient.get('/subscriptions/plans')

      if (plansResponse.data.success) {
        console.log('✅ [Subscription] Loaded', plansResponse.data.data.length, 'plans')
        setPlans(plansResponse.data.data)
      }
    } catch (err: any) {
      console.error('❌ [Subscription] Failed to fetch data:', err)
      const errorMessage = err.response?.data?.message || 'Failed to load subscription data'

      showToast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (planId: number) => {
    if (!userId) {
      showToast.error('User not authenticated')

      return
    }

    try {
      console.log('🔄 [Subscription] Creating subscription for plan:', planId)

      const response = await apiClient.post('/subscriptions/subscribe', {
        planId,
        userId
      })

      if (response.data.success) {
        console.log('✅ [Subscription] Payment intent created')
        setClientSecret(response.data.data.clientSecret)
        setSubscriptionId(response.data.data.subscriptionId)
        setPaymentIntentId(response.data.data.paymentIntentId)
        setCheckoutDialog(true)
      } else {
        showToast.error(response.data.message || 'Failed to create subscription')
      }
    } catch (err: any) {
      console.error('❌ [Subscription] Subscribe error:', err)
      const errorMessage = err.response?.data?.message || 'An error occurred while subscribing'

      showToast.error(errorMessage)
    }
  }

  const handlePaymentSuccess = async () => {
    setCheckoutDialog(false)

    if (userId) {
      await fetchData(userId)
    }
  }

  const handlePaymentError = (errorMessage: string) => {
    console.error('❌ [Subscription] Payment failed:', errorMessage)
  }

  const handleToggleAutoRenew = async () => {
    if (!currentSubscription || !userId) return

    try {
      setAutoRenewLoading(true)
      const newAutoRenew = !currentSubscription.autoRenew

      console.log('🔄 [Subscription] Toggling auto-renew to:', newAutoRenew)

      const response = await apiClient.put('/subscriptions/toggle-auto-renew', {
        subscriptionId: currentSubscription.id,
        userId,
        autoRenew: newAutoRenew
      })

      if (response.data.success) {
        showToast.success(newAutoRenew ? 'Auto-renewal enabled successfully' : 'Auto-renewal disabled successfully')
        console.log('✅ [Subscription] Auto-renew updated')
        await fetchData(userId)
      } else {
        showToast.error(response.data.message || 'Failed to update auto-renewal')
      }
    } catch (err: any) {
      console.error('❌ [Subscription] Toggle auto-renew error:', err)
      const errorMessage = err.response?.data?.message || 'An error occurred'

      showToast.error(errorMessage)
    } finally {
      setAutoRenewLoading(false)
    }
  }

  const handleCancelClick = () => {
    setCancelDialogOpen(true)
  }

  const handleCancelConfirm = async () => {
    if (!currentSubscription || !userId) return

    try {
      setCancelLoading(true)
      console.log('🔄 [Subscription] Cancelling subscription:', currentSubscription.id)

      const response = await apiClient.delete(`/subscriptions/subscriptions/${currentSubscription.id}`, {
        data: { userId }
      })

      if (response.data.success) {
        showToast.success('Subscription cancelled successfully')
        console.log('✅ [Subscription] Subscription cancelled')
        setCancelDialogOpen(false)

        // Reload data
        await fetchData(userId)
      } else {
        showToast.error(response.data.message || 'Failed to cancel subscription')
      }
    } catch (err: any) {
      console.error('❌ [Subscription] Cancel error:', err)
      const errorMessage = err.response?.data?.message || 'An error occurred while cancelling'

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
            </Grid>

            {currentSubscription.status === 'active' && (
              <>
                <Divider sx={{ my: 3 }} />

                <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                  <Box>
                    <Typography variant='subtitle2' fontWeight={600}>
                      Auto-Renewal
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {currentSubscription.autoRenew
                        ? 'Your subscription will renew automatically'
                        : 'Your subscription will not renew'}
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={currentSubscription.autoRenew}
                        onChange={handleToggleAutoRenew}
                        disabled={autoRenewLoading}
                      />
                    }
                    label=''
                  />
                </Box>

                <Box>
                  <Button variant='outlined' color='error' onClick={handleCancelClick} fullWidth>
                    Cancel Subscription
                  </Button>
                </Box>
              </>
            )}

            {currentSubscription.status === 'cancelled' && (
              <Box mt={2}>
                <Typography variant='body2' color='text.secondary'>
                  Your subscription has been cancelled. You can subscribe to a new plan below.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      {(!currentSubscription || currentSubscription.status !== 'active') && (
        <>
          <Typography variant='h5' fontWeight={600} mb={3}>
            Choose Your Plan
          </Typography>
          <Grid container spacing={3}>
            {plans.map(plan => (
              <Grid item xs={12} md={6} lg={4} key={plan.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '2px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography variant='h6' fontWeight={600} gutterBottom>
                      {plan.name}
                    </Typography>

                    <Box display='flex' alignItems='baseline' mb={2}>
                      <Typography variant='h3' fontWeight={700}>
                        {plan.currency} {plan.price}
                      </Typography>
                      <Typography variant='body2' color='text.secondary' ml={1}>
                        /{plan.billingCycle}
                      </Typography>
                    </Box>

                    <Typography variant='body2' color='text.secondary' mb={3}>
                      {plan.description}
                    </Typography>

                    {plan.features && plan.features.length > 0 && (
                      <Box>
                        {plan.features.map((feature, idx) => (
                          <Box key={idx} display='flex' alignItems='center' mb={1.5}>
                            <i
                              className='tabler-check'
                              style={{ marginRight: 8, color: '#22c55e', fontSize: '20px' }}
                            />
                            <Typography variant='body2'>{feature}</Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </CardContent>

                  <Box p={2} borderTop='1px solid' borderColor='divider'>
                    <Button variant='contained' fullWidth size='large' onClick={() => handleSubscribe(plan.id)}>
                      Subscribe Now
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => !cancelLoading && setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Subscription?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel your <strong>{currentSubscription?.plan.name}</strong> subscription?
          </Typography>
          <Typography variant='body2' color='text.secondary' mt={2}>
            Your subscription will remain active until{' '}
            <strong>{currentSubscription ? new Date(currentSubscription.endDate).toLocaleDateString() : ''}</strong>.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} disabled={cancelLoading}>
            Keep Subscription
          </Button>
          <Button color='error' variant='contained' onClick={handleCancelConfirm} disabled={cancelLoading}>
            {cancelLoading ? 'Cancelling...' : 'Cancel Subscription'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={checkoutDialog} onClose={() => setCheckoutDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle>
          <Typography variant='h5' fontWeight={600}>
            Complete Payment
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {clientSecret && subscriptionId && paymentIntentId && userId && (
            <Elements stripe={stripePromise}>
              <CheckoutForm
                clientSecret={clientSecret}
                subscriptionId={subscriptionId}
                paymentIntentId={paymentIntentId}
                userId={userId}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default UserSubscriptionPage

'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'

// MUI Imports
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'

// Third-party Imports
import classnames from 'classnames'
import axios from 'axios'

// Type Imports
import type { SystemMode } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import DirectionalIcon from '@components/DirectionalIcon'
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Styled Components
const ResetPasswordIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  maxBlockSize: 650,
  margin: theme.spacing(12),
  [theme.breakpoints.down(1536)]: { maxBlockSize: 550 },
  [theme.breakpoints.down('lg')]: { maxBlockSize: 450 }
}))

const MaskImg = styled('img')({
  maxBlockSize: 330,
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

const ResetPassword = ({ mode }: { mode: SystemMode }) => {
  // State
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Hooks
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const { lang: locale } = useParams()
  const { settings } = useSettings()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  // Images
  const authBackground = useImageVariant(mode, '/images/pages/auth-mask-light.png', '/images/pages/auth-mask-dark.png')

  const illustration = useImageVariant(
    mode,
    '/images/illustrations/auth/v2-reset-password-light.png',
    '/images/illustrations/auth/v2-reset-password-dark.png'
  )

  // Submit
  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!token) {
      setError('Invalid or missing reset token')

      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')

      return
    }

    setLoading(true)

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        token,
        newPassword: password
      })

      setMessage(res.data.message)

      // ⏳ Redirect after success
      setTimeout(() => {
        window.location.href = getLocalizedUrl('/login', locale as Locale)
      }, 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Reset link expired or invalid')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          { 'border-ie': settings.skin === 'bordered' }
        )}
      >
        <ResetPasswordIllustration src={illustration} />
        {!hidden && (
          <MaskImg src={authBackground} className={classnames({ 'scale-x-[-1]': theme.direction === 'rtl' })} />
        )}
      </div>

      <div className='flex justify-center items-center bs-full bg-backgroundPaper p-6 md:p-12 md:is-[480px]'>
        <Link href={getLocalizedUrl('/login', locale as Locale)} className='absolute block-start-5 inline-start-6'>
          <Logo />
        </Link>

        <div className='flex flex-col gap-6 is-full sm:max-is-[400px]'>
          <div className='flex flex-col gap-1'>
            <Typography variant='h4'>Reset Password 🔒</Typography>
            <Typography>Your new password must be different from previous passwords</Typography>
          </div>

          {error && <Alert severity='error'>{error}</Alert>}
          {message && <Alert severity='success'>{message}</Alert>}

          <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
            <CustomTextField
              autoFocus
              fullWidth
              label='New Password'
              type={isPasswordShown ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton onClick={() => setIsPasswordShown(p => !p)}>
                      <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <CustomTextField
              fullWidth
              label='Confirm Password'
              type={isConfirmPasswordShown ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton onClick={() => setIsConfirmPasswordShown(p => !p)}>
                      <i className={isConfirmPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button fullWidth variant='contained' type='submit' disabled={loading || !!message}>
              {loading ? 'Updating...' : 'Set New Password'}
            </Button>

            <Typography className='flex justify-center items-center' color='primary'>
              <Link href={getLocalizedUrl('/login', locale as Locale)} className='flex items-center gap-1.5'>
                <DirectionalIcon ltrIconClass='tabler-chevron-left' rtlIconClass='tabler-chevron-right' />
                <span>Back to login</span>
              </Link>
            </Typography>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword

'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

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

// Styled Components (UNCHANGED)
const ForgotPasswordIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  maxBlockSize: 650,
  margin: theme.spacing(12)
}))

const MaskImg = styled('img')({
  maxBlockSize: 355,
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

const ForgotPassword = ({ mode }: { mode: SystemMode }) => {
  // 🔹 STATE
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // Hooks
  const { lang: locale } = useParams()
  const { settings } = useSettings()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  const authBackground = useImageVariant(mode, '/images/pages/auth-mask-light.png', '/images/pages/auth-mask-dark.png')

  const illustration = useImageVariant(
    mode,
    '/images/illustrations/auth/v2-forgot-password-light.png',
    '/images/illustrations/auth/v2-forgot-password-dark.png'
  )

  // 🔹 SUBMIT HANDLER
  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, { email })

      setMessage(res.data.message)
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Something went wrong')
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
        <ForgotPasswordIllustration src={illustration} />
        {!hidden && <MaskImg src={authBackground} />}
      </div>

      <div className='flex justify-center items-center bs-full bg-backgroundPaper p-6 md:p-12 md:is-[480px]'>
        <Link href={getLocalizedUrl('/login', locale as Locale)} className='absolute block-start-5 inline-start-6'>
          <Logo />
        </Link>

        <div className='flex flex-col gap-6 is-full sm:max-is-[400px]'>
          <Typography variant='h4'>Forgot Password 🔒</Typography>
          <Typography>Enter your email and we’ll send you instructions</Typography>

          <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
            <CustomTextField
              autoFocus
              fullWidth
              label='Email'
              placeholder='Enter your email'
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <Button fullWidth variant='contained' type='submit' disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>

          {message && <Typography color='primary'>{message}</Typography>}

          <Link
            href={getLocalizedUrl('/login', locale as Locale)}
            className='flex items-center gap-1.5 text-primary justify-center'
          >
            <DirectionalIcon ltrIconClass='tabler-chevron-left' rtlIconClass='tabler-chevron-right' />
            <span>Back to login</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword

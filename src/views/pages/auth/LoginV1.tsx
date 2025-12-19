'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import axios from 'axios'

// MUI
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'

// Components
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'
import AuthIllustrationWrapper from './AuthIllustrationWrapper'

import { getLocalizedUrl } from '@/utils/i18n'
import type { Locale } from '@configs/i18n'

const LoginV1 = () => {
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const { lang: locale } = useParams()

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        email,
        password
      })

      console.log('🔥 Login Response:', res.data)
      console.log('🔥 FRONTEND API URL =', process.env.NEXT_PUBLIC_API_URL)

      if (!res.data.success) {
        throw new Error(res.data.message || 'Login failed')
      }

      // 🔥 FIX 1: Save correct token key (backend sends "accessToken")
      localStorage.setItem('accessToken', res.data.accessToken)
      localStorage.setItem('refreshToken', res.data.refreshToken)

      // 🔥 FIX 2: Transform user object to match frontend expectations
      const userData = {
        id: res.data.user.id,
        name: res.data.user.name,
        email: res.data.user.email,
        roleId: res.data.user.roleId,
        roleName: res.data.user.role, // Backend sends "role", frontend expects "roleName"
        role: res.data.user.role // Keep both for compatibility
      }

      // 🔥 FIX 3: Save as "userData" (not "user")
      localStorage.setItem('userData', JSON.stringify(userData))

      console.log('✅ Saved to localStorage:')
      console.log('  - accessToken:', res.data.accessToken)
      console.log('  - userData:', userData)

      alert('Login successful!')

      // Redirect to dashboard
      window.location.href = `/${locale}/dashboards/crm`
    } catch (error: any) {
      console.error('❌ Login error:', error)
      alert(error.response?.data?.message || error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthIllustrationWrapper>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='sm:!p-12'>
          <Link href={getLocalizedUrl('/', locale as Locale)} className='flex justify-center mbe-6'>
            <Logo />
          </Link>

          <div className='flex flex-col gap-1 mbe-6'>
            <Typography variant='h4'>Welcome 👋🏻</Typography>
            <Typography>Please sign in to continue</Typography>
          </div>

          <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
            <CustomTextField fullWidth label='Email' value={email} onChange={e => setEmail(e.target.value)} required />

            <CustomTextField
              fullWidth
              label='Password'
              type={isPasswordShown ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton onClick={() => setIsPasswordShown(show => !show)}>
                      <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <div className='flex justify-between items-center'>
              <FormControlLabel control={<Checkbox />} label='Remember me' />
              <Typography
                component={Link}
                href={getLocalizedUrl('/forgot-password', locale as Locale)}
                color='primary'
                className='cursor-pointer'
              >
                Forgot password?
              </Typography>
            </div>

            <Button fullWidth variant='contained' type='submit' disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>New on our platform?</Typography>
              <Typography component={Link} href={getLocalizedUrl('/register', locale as Locale)} color='primary'>
                Create an account
              </Typography>
            </div>

            <Divider className='gap-2 text-textPrimary'>or</Divider>

            <div className='flex justify-center items-center gap-2'>
              <IconButton className='text-facebook'>
                <i className='tabler-brand-facebook-filled' />
              </IconButton>
              <IconButton className='text-twitter'>
                <i className='tabler-brand-twitter-filled' />
              </IconButton>
              <IconButton className='text-github'>
                <i className='tabler-brand-github-filled' />
              </IconButton>
              <IconButton className='text-googlePlus'>
                <i className='tabler-brand-google-filled' />
              </IconButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthIllustrationWrapper>
  )
}

export default LoginV1

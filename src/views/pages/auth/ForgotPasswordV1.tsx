'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import axios from 'axios'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

import CustomTextField from '@core/components/mui/TextField'
import { getLocalizedUrl } from '@/utils/i18n'
import type { Locale } from '@configs/i18n'
import AuthIllustrationWrapper from './AuthIllustrationWrapper'
import Logo from '@components/layout/shared/Logo'

const ForgotPasswordV1 = () => {
  const { lang: locale } = useParams()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, { email })

      setMessage(res.data.message)
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Something went wrong')
    }
  }

  return (
    <AuthIllustrationWrapper>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='sm:!p-12'>
          <Link href={getLocalizedUrl('/', locale as Locale)} className='flex justify-center mbe-6'>
            <Logo />
          </Link>

          <Typography variant='h4'>Forgot Password 🔒</Typography>

          <form onSubmit={handleSubmit} className='flex flex-col gap-6 mt-4'>
            <CustomTextField fullWidth label='Email' value={email} onChange={e => setEmail(e.target.value)} />
            <Button fullWidth variant='contained' type='submit'>
              Send Reset Link
            </Button>
          </form>

          {message && <Typography color='primary'>{message}</Typography>}
        </CardContent>
      </Card>
    </AuthIllustrationWrapper>
  )
}

export default ForgotPasswordV1

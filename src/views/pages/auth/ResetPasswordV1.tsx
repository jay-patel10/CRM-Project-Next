'use client'

import { useState } from 'react'

import { useSearchParams } from 'next/navigation'

import axios from 'axios'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import CustomTextField from '@core/components/mui/TextField'
import AuthIllustrationWrapper from './AuthIllustrationWrapper'

const ResetPasswordV1 = () => {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        token,
        newPassword: password
      })

      setMessage(res.data.message)
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Invalid or expired link')
    }
  }

  return (
    <AuthIllustrationWrapper>
      <Card>
        <CardContent>
          <Typography variant='h4'>Reset Password</Typography>

          <form onSubmit={handleSubmit} className='flex flex-col gap-6 mt-4'>
            <CustomTextField
              label='New Password'
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <Button variant='contained' type='submit'>
              Set New Password
            </Button>
          </form>

          {message && <Typography color='primary'>{message}</Typography>}
        </CardContent>
      </Card>
    </AuthIllustrationWrapper>
  )
}

export default ResetPasswordV1

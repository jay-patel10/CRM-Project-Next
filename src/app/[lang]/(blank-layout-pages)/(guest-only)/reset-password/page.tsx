// Next Imports
import type { Metadata } from 'next'

// Component Imports
import ResetPasswordV1 from '@views/ResetPassword'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your account password'
}

const ResetPasswordPage = () => {
  const mode = getServerMode()

  return <ResetPasswordV1 mode={mode} />
}

export default ResetPasswordPage

'use client'

import type { ReactNode } from 'react'

import Providers from './Providers'
import { PermissionProvider } from '@/contexts/PermissionContext'

const ProtectedProviders = ({ children, direction }: { children: ReactNode; direction: 'ltr' | 'rtl' }) => {
  return (
    <PermissionProvider>
      <Providers direction={direction}>{children}</Providers>
    </PermissionProvider>
  )
}

export default ProtectedProviders

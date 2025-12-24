'use client'

// components/Providers.tsx
import type { ChildrenType, Direction } from '@core/types'

import ReduxProvider from '@/redux-store/ReduxProvider'
import AppReactToastify from '@/libs/styles/AppReactToastify'

type Props = ChildrenType & {
  direction: Direction
}

const Providers = ({ children, direction }: Props) => {
  return (
    <>
      <ReduxProvider>{children}</ReduxProvider>
      <AppReactToastify direction={direction} hideProgressBar />
    </>
  )
}

export default Providers

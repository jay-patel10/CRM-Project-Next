// components/Providers.tsx
import type { ChildrenType, Direction } from '@core/types'

import { VerticalNavProvider } from '@menu/contexts/verticalNavContext'
import { SettingsProvider } from '@core/contexts/settingsContext'
import ThemeProvider from '@components/theme'
import ReduxProvider from '@/redux-store/ReduxProvider'
import { PermissionProvider } from '@/contexts/PermissionContext'

import AppReactToastify from '@/libs/styles/AppReactToastify'
import { getMode, getSettingsFromCookie, getSystemMode } from '@core/utils/serverHelpers'

type Props = ChildrenType & {
  direction: Direction
}

const Providers = ({ children, direction }: Props) => {
  const mode = getMode()
  const settingsCookie = getSettingsFromCookie()
  const systemMode = getSystemMode()

  return (
    <VerticalNavProvider>
      <SettingsProvider settingsCookie={settingsCookie} mode={mode}>
        <ThemeProvider direction={direction} systemMode={systemMode}>
          <PermissionProvider>
            <ReduxProvider>{children}</ReduxProvider>
            <AppReactToastify direction={direction} hideProgressBar />
          </PermissionProvider>
        </ThemeProvider>
      </SettingsProvider>
    </VerticalNavProvider>
  )
}

export default Providers

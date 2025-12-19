// utils/toast.ts
// Save as: src/utils/toast.ts

import { toast } from 'react-toastify'

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    })
  },

  error: (message: string) => {
    toast.error(message, {
      position: 'top-right',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    })
  },

  warning: (message: string) => {
    toast.warning(message, {
      position: 'top-right',
      autoClose: 3500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    })
  },

  info: (message: string) => {
    toast.info(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    })
  }
}

// Permission checker utility
export const checkPermission = (module: string, action: string): boolean => {
  try {
    const userData = localStorage.getItem('userData')

    if (!userData) return false

    const user = JSON.parse(userData)

    // Admin (roleId: 1) has all permissions
    if (user.roleId === 1) return true

    // Check user's role permissions
    const permissions = user.permissions || {}

    return permissions[module]?.[action] === true
  } catch (err) {
    console.error('Permission check error:', err)

    return false
  }
}

// Get current user data
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('userData')

    return userData ? JSON.parse(userData) : null
  } catch (err) {
    console.error('Get user error:', err)

    return null
  }
}

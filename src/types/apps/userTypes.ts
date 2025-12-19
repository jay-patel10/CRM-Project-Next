// User Types based on your Sequelize model
export type UsersType = {
  id: number
  email: string
  name: string
  password?: string // Optional as it shouldn't be sent to frontend
  phone?: string | null
  avatar?: string | null
  roleId?: number | null
  isActive: boolean
  lastLogin?: Date | string | null
  createdAt?: Date | string
  updatedAt?: Date | string

  // Additional fields for display
  role?: string // Role name from join
  roleName?: string
}

// For API responses
export type UserResponse = Omit<UsersType, 'password'>

// For creating new users
export type CreateUserInput = {
  email: string
  name: string
  password: string
  phone?: string
  avatar?: string
  roleId?: number
  isActive?: boolean
}

// For updating users
export type UpdateUserInput = Partial<Omit<CreateUserInput, 'password'>> & {
  password?: string
}

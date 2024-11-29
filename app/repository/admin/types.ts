export type CreateUserInput = {
  email: string
  password: string
  name: string
  role?: 'ADMIN' | 'USER'
}

export type UpdateUserInput = Partial<Omit<CreateUserInput, 'password'>>

export type User = {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'USER'
  createdAt: Date
  updatedAt: Date
}

export type UserListItem = Pick<
  User,
  'id' | 'email' | 'name' | 'role' | 'createdAt'
>

export const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  permissions: true,
} as const

export type CreateUserInput = {
  email: string
  password: string
  name: string
  role?: 'ADMIN' | 'USER'
}

export type UpdateUserInput = Partial<Omit<CreateUserInput, 'password'>>

export const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const 
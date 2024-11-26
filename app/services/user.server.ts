import bcrypt from 'bcryptjs'
import { db } from './db.server'

type CreateUserInput = {
  email: string
  password: string
  name: string
  role?: 'ADMIN' | 'USER'
}

type UpdateUserInput = Partial<Omit<CreateUserInput, 'password'>>

export class UserService {
  private static readonly userSelect = {
    id: true,
    email: true,
    name: true,
    role: true,
    createdAt: true,
    updatedAt: true,
  } as const

  static async listUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      db.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: this.userSelect,
      }),
      db.user.count(),
    ])

    return {
      users,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit,
        hasMore: skip + users.length < total,
      },
    }
  }

  static async getPaginatedUsers(cursor: string | null, limit: number = 10) {
    const users = await db.user.findMany({
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      select: this.userSelect,
    })

    const nextCursor = users[users.length - 1]?.id

    return {
      users,
      nextCursor,
    }
  }

  static async getById(id: string) {
    const user = await db.user.findUnique({
      where: { id },
      select: this.userSelect,
    })

    if (!user) {
      throw new Error('User not found')
    }

    return user
  }

  static async getByEmail(email: string) {
    const user = await db.user.findUnique({
      where: { email },
      select: this.userSelect,
    })

    if (!user) {
      throw new Error('User not found')
    }

    return user
  }

  static async createUser({
    email,
    password,
    name,
    role = 'USER',
  }: CreateUserInput) {
    // Validate email
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email address')
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (existingUser) {
      throw new Error('Email already in use')
    }

    // Validate password
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long')
    }

    // Validate name
    if (!name || name.length < 2) {
      throw new Error('Name must be at least 2 characters long')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    return db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
      select: this.userSelect,
    })
  }

  static async updateUser(id: string, data: UpdateUserInput) {
    // Validate if user exists
    await this.getById(id)

    // Validate email if provided
    if (data.email) {
      if (!data.email.includes('@')) {
        throw new Error('Invalid email address')
      }

      // Check if new email is already in use by another user
      const existingUser = await db.user.findUnique({
        where: { email: data.email },
        select: { id: true },
      })

      if (existingUser && existingUser.id !== id) {
        throw new Error('Email already in use')
      }
    }

    // Validate name if provided
    if (data.name && data.name.length < 2) {
      throw new Error('Name must be at least 2 characters long')
    }

    return db.user.update({
      where: { id },
      data,
      select: this.userSelect,
    })
  }

  static async deleteUser(id: string) {
    // Validate if user exists
    await this.getById(id)

    return db.user.delete({
      where: { id },
      select: this.userSelect,
    })
  }

  static async updatePassword(
    id: string,
    currentPassword: string,
    newPassword: string
  ) {
    // Validate new password
    if (!newPassword || newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long')
    }

    // Get user with password
    const user = await db.user.findUnique({
      where: { id },
      select: { ...this.userSelect, password: true },
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      throw new Error('Current password is incorrect')
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    return db.user.update({
      where: { id },
      data: { password: hashedPassword },
      select: this.userSelect,
    })
  }

  static async verifyPassword(email: string, password: string) {
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    })

    if (!user) {
      return false
    }

    return bcrypt.compare(password, user.password)
  }
}

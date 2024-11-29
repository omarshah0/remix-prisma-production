import bcrypt from 'bcryptjs'
import { db } from '~/services/db.server'
import { CreateUserInput, UpdateUserInput, userSelect } from './types'

export class UserRepository {
  static async list(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      db.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: userSelect,
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

  static async getById(id: string) {
    const user = await db.user.findUnique({
      where: { id },
      select: userSelect,
    })

    if (!user) {
      throw new Error('User not found')
    }

    return user
  }

  static async getByEmail(email: string) {
    const user = await db.user.findUnique({
      where: { email },
      select: userSelect,
    })

    if (!user) {
      throw new Error('User not found')
    }

    return user
  }

  static async create({
    email,
    password,
    name,
    role = 'USER',
  }: CreateUserInput) {
    const hashedPassword = await bcrypt.hash(password, 10)

    return db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
      select: userSelect,
    })
  }

  static async update(id: string, data: UpdateUserInput) {
    return db.user.update({
      where: { id },
      data,
      select: userSelect,
    })
  }

  static async delete(id: string) {
    return db.user.delete({
      where: { id },
      select: userSelect,
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

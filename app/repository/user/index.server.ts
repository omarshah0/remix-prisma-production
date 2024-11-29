import bcrypt from 'bcryptjs'
import { db } from '~/services/db.server'
import { CreateUserInput, UpdateUserInput, userSelect } from './types'

export async function listUsers(page: number = 1, limit: number = 10) {
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

export async function getUserById(id: string) {
  const user = await db.user.findUnique({
    where: { id },
    select: userSelect,
  })

  if (!user) {
    throw new Error('User not found')
  }

  return user
}

export async function getUserByEmail(email: string) {
  const user = await db.user.findUnique({
    where: { email },
    select: userSelect,
  })

  if (!user) {
    throw new Error('User not found')
  }

  return user
}

export async function createUser({
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

export async function updateUser(id: string, data: UpdateUserInput) {
  return db.user.update({
    where: { id },
    data,
    select: userSelect,
  })
}

export async function deleteUser(id: string) {
  return db.user.delete({
    where: { id },
    select: userSelect,
  })
}

export async function verifyUserPassword(email: string, password: string) {
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, password: true },
  })

  if (!user) {
    return false
  }

  return bcrypt.compare(password, user.password)
}

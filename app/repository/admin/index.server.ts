import bcrypt from 'bcryptjs'
import { db } from '~/services/db.server'
import { CreateUserInput, UpdateUserInput, userSelect } from './types'
import { bulkCreate } from './bulk.server'

export async function list(cursor?: string, limit: number = 10) {
  // Enforce pagination limits: minimum 10, maximum 100 items per page
  limit = limit > 100 ? 100 : limit < 10 ? 10 : limit
  const records = await db.admin.findMany({
    take: limit + 1, // Take one extra to check if there are more
    ...(cursor && {
      cursor: {
        id: cursor,
      },
    }),
    orderBy: { createdAt: 'desc' },
    select: userSelect,
  })

  const hasNextPage = records.length > limit
  const items = hasNextPage ? records.slice(0, -1) : records
  const nextCursor = hasNextPage ? records[records.length - 2].id : undefined

  return {
    data: items,
    pagination: {
      nextCursor,
      hasNextPage,
      limit,
    },
  }
}

export async function getById(id: string) {
  const record = await db.admin.findUnique({
    where: { id },
    select: userSelect,
  })

  if (!record) {
    throw new Error('Record not found')
  }

  return record
}

export async function getByEmail(email: string) {
  const record = await db.admin.findUnique({
    where: { email },
    select: userSelect,
  })

  if (!record) {
    throw new Error('Record not found')
  }

  return record
}

export async function create({
  email,
  password,
  name,
  role = 'USER',
}: CreateUserInput) {
  const hashedPassword = await bcrypt.hash(password, 10)

  const record = await db.admin.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
    },
    select: userSelect,
  })

  return record
}

export async function update(id: string, data: UpdateUserInput) {
  const record = await db.admin.update({
    where: { id },
    data,
    select: userSelect,
  })

  return record
}

export async function remove(id: string) {
  await db.admin.delete({
    where: { id },
    select: userSelect,
  })

  return 'Record deleted successfully'
}

export async function verifyPassword(email: string, password: string) {
  const user = await db.admin.findUnique({
    where: { email },
    select: { id: true, password: true },
  })

  if (!user) {
    return false
  }

  return bcrypt.compare(password, user.password)
}

export { bulkCreate }

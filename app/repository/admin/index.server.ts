import bcrypt from 'bcryptjs'
import { db } from '~/services/db.server'
import { CreateUserInput, UpdateUserInput, userSelect } from './types'
import { bulkCreate } from './bulk.server'
import { Prisma } from '@prisma/client'

// Define valid sort columns
type SortableColumn = 'createdAt' | 'updatedAt' | 'email' | 'name'
type SortOrder = 'asc' | 'desc'

// Validate if the provided column is sortable
function isValidSortColumn(column: string): column is SortableColumn {
  return ['createdAt', 'updatedAt', 'email', 'name'].includes(column)
}

// Validate if the provided order is valid
function isValidSortOrder(order: string): order is SortOrder {
  return ['asc', 'desc'].includes(order.toLowerCase())
}

export async function list(
  cursor?: string,
  limit: number = 10,
  sortBy?: string,
  sortOrder?: string
) {
  // Enforce pagination limits: minimum 10, maximum 100 items per page
  limit = limit > 100 ? 100 : limit < 10 ? 10 : limit

  // Default sort configuration
  let orderBy: Prisma.AdminOrderByWithRelationInput = { createdAt: 'desc' }

  // Validate and apply custom sorting if provided
  if (sortBy) {
    if (isValidSortColumn(sortBy)) {
      const validatedOrder = sortOrder?.toLowerCase() || 'desc'
      if (isValidSortOrder(validatedOrder)) {
        orderBy = { [sortBy]: validatedOrder }
      }
    }
  }

  const records = await db.admin.findMany({
    take: limit + 1, // Take one extra to check if there are more
    ...(cursor && {
      skip: 1, // Skip the cursor item to avoid duplication
      cursor: {
        id: cursor,
      },
    }),
    orderBy,
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
    sort: {
      column: sortBy || 'createdAt',
      order: (sortOrder?.toLowerCase() as SortOrder) || 'desc',
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

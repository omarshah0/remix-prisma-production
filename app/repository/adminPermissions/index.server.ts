import { db } from '~/services/db.server'
import { Prisma } from '@prisma/client'
import { adminPermissionSelect } from './types'

export async function getById(id: string) {
  const record = await db.adminPermission.findMany({
    where: { adminId: id },
    select: adminPermissionSelect,
  })

  if (!record) {
    throw new Error('Record not found')
  }

  return record
}

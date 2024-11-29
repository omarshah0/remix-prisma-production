import { getById } from '~/repository/adminPermissions/index.server'

export async function hasPermission(
  userId: string,
  operationName: string
): Promise<boolean> {
  // Get the user's permissions
  const permissions = await getById(userId)

  return permissions.some(
    permission => permission.operation.name === operationName
  )
}

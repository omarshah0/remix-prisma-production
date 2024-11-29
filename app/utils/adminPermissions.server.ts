type Operation = {
  id: string
  name: string
  description: string
  createdAt: Date
  updatedAt: Date
}

export type AdminPermission = {
  id: string
  operation: Operation
  createdAt: Date
  updatedAt: Date
}

export function hasPermission(
  permissions: AdminPermission[],
  operationName: string
): boolean {
  return permissions.some(
    permission => permission.operation.name === operationName
  )
}

import { PrismaClient } from '@prisma/client'
import { config } from '~/config/config.server'

declare global {
  var __db__: PrismaClient | undefined
}

let db: PrismaClient

if (config.server.env === 'production') {
  db = new PrismaClient()
} else {
  if (!global.__db__) {
    global.__db__ = new PrismaClient()
  }
  db = global.__db__
  db.$connect()
}

export { db }

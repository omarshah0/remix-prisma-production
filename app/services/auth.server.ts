import { createCookieSessionStorage, redirect, Session } from '@remix-run/node'
import { config } from '~/config/config.server'
import { redis } from './redis.server'
import { getById } from '~/repository/admin/index.server'

const sessionSecret = config.session.secret
if (!sessionSecret) {
  throw new Error('SESSION_SECRET must be set')
}

const storage = createCookieSessionStorage({
  cookie: {
    name: 'app_session',
    secure: config.server.env === 'production',
    secrets: [sessionSecret],
    sameSite: 'lax',
    path: '/',
    maxAge: config.session.expiry,
    httpOnly: true,
  },
})

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await storage.getSession()
  session.set('userId', userId)

  // Generate a unique session ID
  const sessionId = crypto.randomUUID()

  // Store session in Redis with user info
  await redis.set(`session:${sessionId}`, userId)
  await redis.expire(`session:${sessionId}`, config.redis.sessionExpiry)

  // Invalidate any existing sessions for this user
  const userKey = `user:${userId}:sessions`
  const existingSessions = await redis.sMembers(userKey)

  // Remove old sessions
  for (const oldSessionId of existingSessions) {
    await redis.del(`session:${oldSessionId}`)
  }
  await redis.del(userKey)

  // Add new session to user's set
  await redis.sAdd(userKey, sessionId)

  // Set cookie with session ID
  session.set('sessionId', sessionId)

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  })
}

export async function requireUserId(request: Request) {
  const session = await getUserSession(request)
  const userId = session.get('userId')
  const sessionId = session.get('sessionId')

  if (!userId || !sessionId) {
    const headers = await cleanupSession(session)
    throw redirect('/login', { headers })
  }

  try {
    // First verify session exists in Redis
    const storedUserId = await redis.get(`session:${sessionId}`)
    if (!storedUserId || storedUserId !== userId) {
      const headers = await cleanupSession(session)
      throw redirect('/login', { headers })
    }

    // Then verify user exists in database
    await getById(userId)
    return userId
  } catch (error) {
    // Clean up Redis sessions regardless of error type
    const headers = await cleanupSession(session)
    throw redirect('/login', { headers })
  }
}

// Helper function to clean up sessions and return headers for cookie cleanup
async function cleanupSession(session: Session) {
  const userId = session.get('userId')
  const sessionId = session.get('sessionId')

  if (sessionId) {
    await redis.del(`session:${sessionId}`)
  }

  if (userId) {
    const userKey = `user:${userId}:sessions`
    const sessions = await redis.sMembers(userKey)

    // Delete all sessions for this user
    for (const sessionId of sessions) {
      await redis.del(`session:${sessionId}`)
    }

    // Delete the user's session set
    await redis.del(userKey)
  }

  // Return headers with destroyed session cookie
  return {
    'Set-Cookie': await storage.destroySession(session),
  }
}

export async function getUserSession(request: Request) {
  return storage.getSession(request.headers.get('Cookie'))
}

export async function logout(request: Request) {
  const session = await getUserSession(request)
  const sessionId = session.get('sessionId')
  const userId = session.get('userId')

  if (sessionId) {
    // Remove session from Redis
    await redis.del(`session:${sessionId}`)
    if (userId) {
      await redis.sRem(`user:${userId}:sessions`, sessionId)
    }
  }

  return redirect('/', {
    headers: {
      'Set-Cookie': await storage.destroySession(session),
    },
  })
}

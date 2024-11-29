import { createCookieSessionStorage, redirect } from '@remix-run/node'
import { config } from '~/config/config.server'

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
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  })
}

export async function requireUserId(request: Request) {
  const session = await getUserSession(request)
  const userId = session.get('userId')
  if (!userId) {
    throw redirect('/login')
  }
  return userId
}

export async function getUserSession(request: Request) {
  return storage.getSession(request.headers.get('Cookie'))
}

export async function logout(request: Request) {
  const session = await getUserSession(request)
  return redirect('/', {
    headers: {
      'Set-Cookie': await storage.destroySession(session),
    },
  })
}

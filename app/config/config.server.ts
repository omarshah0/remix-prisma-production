export const config = {
  session: {
    secret: process.env.SESSION_SECRET,
    expiry: process.env.SESSION_EXPIRY
      ? parseInt(process.env.SESSION_EXPIRY) * 1000
      : 60 * 1000,
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  server: {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    sessionExpiry: process.env.REDIS_SESSION_EXPIRY
      ? parseInt(process.env.REDIS_SESSION_EXPIRY)
      : 24 * 60 * 60, // 24 hours in seconds
  },
}

console.log(config.redis.url)

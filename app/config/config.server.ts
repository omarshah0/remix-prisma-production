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
}

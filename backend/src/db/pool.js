import pg from 'pg'
import 'dotenv/config'

const { Pool } = pg

function parseBool(value) {
  const v = String(value ?? '').trim().toLowerCase()
  if (!v) return null
  if (['true', '1', 'yes', 'y', 'on'].includes(v)) return true
  if (['false', '0', 'no', 'n', 'off'].includes(v)) return false
  return null
}

const envSsl = parseBool(process.env.DB_SSL)
const shouldUseSSL =
  envSsl !== null ? envSsl : String(process.env.NODE_ENV || '').toLowerCase() === 'production'

const common = {
  ssl: shouldUseSSL ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ...common })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'olympo_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      ...common,
    })

pool.on('error', (err) => {
  console.error('Erro inesperado no pool de conexões:', err)
  process.exit(-1)
})

export default pool

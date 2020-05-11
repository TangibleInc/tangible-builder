import path from 'path'
import dotenv from 'dotenv'

const envPath = path.join(
  process.cwd(),
  `.env.${ process.env.NODE_ENV || 'production' }`
)

const {
  parsed: env
} = dotenv.config({
  path: envPath
})

console.log('Server', env)

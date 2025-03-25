import 'dotenv/config'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { DriverRuntime } from './drivers/runtime'
import { loadAndStartAllDrivers } from './drivers/loader'
import driverRoutes from './routes/drivers'
import { watchForNewDrivers } from './drivers/registry'

const app = new Hono()

app.use('*', cors({ origin: '*' }))

app.get('/', (c) => c.text('Hello from HomeFlow'))

app.route('/api/drivers', driverRoutes)

const start = async () => {
  console.log('[boot] discovering drivers')
  await DriverRuntime.discoverDrivers()
  await watchForNewDrivers()
  
  console.log('[boot] loading + starting all enabled drivers')
  await loadAndStartAllDrivers()

  console.log('[boot] HomeFlow is ready')
  serve({ fetch: app.fetch, port: Number(process.env.PORT || 3000) })
}

start().catch((err) => {
  console.error('[fatal]', err)
  process.exit(1)
})
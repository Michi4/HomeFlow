import 'dotenv/config'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { discoverDrivers } from './drivers/loader'
import { loadAndStartAllDrivers } from './drivers/loader'
import { watchForNewDrivers } from './drivers/registry'

import driverRoutes from './routes/drivers'
import dataRoutes from './routes/data'

const app = new Hono()

app.use('*', cors({ origin: '*' }))

app.get('/', (c) => c.text('Hello from HomeFlow'))

app.route('/api/drivers', driverRoutes)
app.route('/api/data', dataRoutes)


const start = async () => {
  console.log('[boot] discovering drivers')
  await discoverDrivers()
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
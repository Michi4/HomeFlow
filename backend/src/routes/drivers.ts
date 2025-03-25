import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { drivers, devices } from '../db/schema'
import { getDriverByName, startDriver, stopDriver } from '../drivers/registry'

const route = new Hono()

// GET /api/drivers/           → List all drivers
route.get('/', async (c) => {
  const all = await db.select().from(drivers)
  return c.json(all)
})

// POST /api/drivers/:name/start
route.post('/:name/start', async (c) => {
  const name = c.req.param('name')
  try {
    await startDriver(name)
    return c.json({ success: true })
  } catch (err) {
    return c.json({ success: false, error: (err as Error).message }, 500)
  }
})

// POST /api/drivers/:name/stop
route.post('/:name/stop', async (c) => {
  const name = c.req.param('name')
  try {
    await stopDriver(name)
    return c.json({ success: true })
  } catch (err) {
    return c.json({ success: false, error: (err as Error).message }, 500)
  }
})

// POST /api/drivers/:name/config → update config + reload driver
route.post('/:name/config', async (c) => {
  const name = c.req.param('name')
  const data = await c.req.json()

  await db.update(drivers).set({ config: data }).where(eq(drivers.name, name))

  const runtime = getDriverByName(name)
  if (runtime) await runtime.reload(data)

  return c.json({ success: true })
})

// GET /api/drivers/devices → list all known devices
route.get('/devices', async (c) => {
  const all = await db.select().from(devices)
  return c.json(all)
})

export default route
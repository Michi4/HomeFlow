import { Hono } from 'hono'
import { getAllDevices, getDeviceProperties, getDeviceData, getDeviceCurrentData } from '../drivers/registry'
import { db } from '../db/client'
import { deviceProperties, deviceCurrentData, deviceData } from '../db/schema'
import { eq } from 'drizzle-orm'

const route = new Hono()

// GET /api/data/devices → list all devices
route.get('/devices', async (c) => {
  const result = await getAllDevices()
  return c.json(result)
})

// GET /api/data/devices/:id/properties → list all properties of a device
route.get('/devices/:id/properties', async (c) => {
  const id = Number(c.req.param('id'))
  const result = await getDeviceProperties(id)
  return c.json(result)
})

// GET /api/data/properties/:id/history → fetch historical data for a property
route.get('/properties/:id/history', async (c) => {
  const id = Number(c.req.param('id'))
  const result = await getDeviceData(id)
  return c.json(result)
})

// GET /api/data/properties/:id/current → fetch current/latest value for a property
route.get('/properties/:id/current', async (c) => {
  const id = Number(c.req.param('id'))
  const result = await getDeviceCurrentData(id)
  return c.json(result)
})

route.post('/properties/:id/write', async (c) => {
  const propertyId = Number(c.req.param('id'))
  const { value } = await c.req.json()

  const [prop] = await db.select().from(deviceProperties).where(eq(deviceProperties.id, propertyId))
  if (!prop) return c.json({ error: 'Property not found' }, 404)
  if (!prop.writable) return c.json({ error: 'Property is not writable' }, 400)

  const now = new Date()

  // Write to current
  await db
    .insert(deviceCurrentData)
    .values({ propertyId, value, updatedAt: now })
    .onConflictDoUpdate({
      target: deviceCurrentData.propertyId,
      set: { value, updatedAt: now },
    })

  // Append to history
  await db.insert(deviceData).values({ propertyId, value, timestamp: now })

  return c.json({ success: true })
})


export default route

import { Hono } from 'hono'
import { db } from '../db/client'
import { devices, deviceCurrentData, deviceData, deviceProperties } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { getRuntimeForDevice } from '../drivers/registry'

export const devicesRoute = new Hono()

// Get all devices
devicesRoute.get('/', async (c) => {
  const all = await db.select().from(devices)
  return c.json(all)
})

// Get device info
devicesRoute.get('/:id', async (c) => {
  const id = decodeURIComponent(c.req.param('id'))
  const [device] = await db.select().from(devices).where(eq(devices.name, id))
  if (!device) return c.notFound()

  const properties = await db.select().from(deviceProperties).where(eq(deviceProperties.deviceId, device.id))
  return c.json({ ...device, properties })
})

// Get current value of a property
devicesRoute.get('/:id/:key', async (c) => {
  const id = decodeURIComponent(c.req.param('id'))
  const key = c.req.param('key')

  const [device] = await db.select().from(devices).where(eq(devices.name, id))
  if (!device) return c.notFound()

  const [prop] = await db.select().from(deviceProperties).where(and(eq(deviceProperties.deviceId, device.id), eq(deviceProperties.key, key)))
  if (!prop) return c.notFound()

  const [current] = await db.select().from(deviceCurrentData).where(eq(deviceCurrentData.propertyId, prop.id))
  return c.json(current ?? null)
})

// Get historical values
devicesRoute.get('/:id/:key/history', async (c) => {
  const id = decodeURIComponent(c.req.param('id'))
  const key = c.req.param('key')

  const [device] = await db.select().from(devices).where(eq(devices.name, id))
  if (!device) return c.notFound()

  const [prop] = await db.select().from(deviceProperties).where(and(eq(deviceProperties.deviceId, device.id), eq(deviceProperties.key, key)))
  if (!prop) return c.notFound()

  const history = await db.select().from(deviceData).where(eq(deviceData.propertyId, prop.id))
  return c.json(history)
})

// Set value of a property (POST)
devicesRoute.post('/:id/:key', async (c) => {
  const id = decodeURIComponent(c.req.param('id'))
  const key = c.req.param('key')
  const body = await c.req.json()
  const value = body?.value

  const [device] = await db.select().from(devices).where(eq(devices.name, id))
  if (!device) return c.notFound()

  const [prop] = await db.select().from(deviceProperties).where(and(eq(deviceProperties.deviceId, device.id), eq(deviceProperties.key, key)))
  if (!prop || !prop.writable) return c.text('Not writable', 400)

  const runtime = getRuntimeForDevice(id)
  if (!runtime) return c.text('Driver not found', 500)

  await runtime.sendProperty(id, key, value)
  return c.json({ ok: true })
})

// Enable/disable per property
devicesRoute.post('/:id/:key/enable', async (c) => {
  const id = decodeURIComponent(c.req.param('id'))
  const key = c.req.param('key')

  const runtime = getRuntimeForDevice(id)
  if (!runtime) return c.text('Driver not found', 500)

  await runtime.sendProperty(id, key, true)
  return c.json({ ok: true })
})

devicesRoute.post('/:id/:key/disable', async (c) => {
  const id = decodeURIComponent(c.req.param('id'))
  const key = c.req.param('key')

  const runtime = getRuntimeForDevice(id)
  if (!runtime) return c.text('Driver not found', 500)

  await runtime.sendProperty(id, key, false)
  return c.json({ ok: true })
})

// Enable or disable device (main switch)
devicesRoute.post('/:id/enable', async (c) => {
  const id = decodeURIComponent(c.req.param('id'))
  const runtime = getRuntimeForDevice(id)
  if (!runtime) return c.text('Driver not found', 500)

  await runtime.sendProperty(id, 'power', true)
  return c.json({ ok: true })
})

devicesRoute.post('/:id/disable', async (c) => {
  const id = decodeURIComponent(c.req.param('id'))
  const runtime = getRuntimeForDevice(id)
  if (!runtime) return c.text('Driver not found', 500)

  await runtime.sendProperty(id, 'power', false)
  return c.json({ ok: true })
})

// Optional advanced action
devicesRoute.post('/:id/actions/:action', async (c) => {
  const id = decodeURIComponent(c.req.param('id'))
  const action = c.req.param('action')
  const body = await c.req.json()

  const runtime = getRuntimeForDevice(id)
  if (!runtime || !runtime.runAction) return c.text('Driver or action not found', 500)

  const result = await runtime.runAction(id, action, body)
  return c.json({ ok: true, result })
})

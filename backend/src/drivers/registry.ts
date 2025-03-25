import { DriverRuntime } from './runtime'
import { getDriver, registerDriver } from './registry'
import { loadDriverFromFile } from './loader'
import { db } from '../db/client'
import { drivers as driversTable } from '../db/schema'
import { eq } from 'drizzle-orm'
import path from 'path'
import chokidar from 'chokidar'

const drivers = new Map<string, DriverRuntime>()

export function registerDriver(name: string, runtime: DriverRuntime) {
  drivers.set(name, runtime)
}

export function getDriver(name: string) {
  return drivers.get(name)
}

export function getAllDrivers() {
  return Array.from(drivers.values())
}

export function removeDriver(name: string) {
  return drivers.delete(name)
}

export async function startDriver(name: string) {
  let drv = drivers.get(name)

  if (!drv) {
    const [record] = await db.select().from(driversTable).where(eq(driversTable.name, name))
    if (!record || !record.sourcePath) throw new Error(`Driver '${name}' not found in DB or missing path`)

    const mod = await loadDriverFromFile(record.sourcePath)
    drv = new DriverRuntime(mod, {
      ...(typeof record.config === 'object' && record.config !== null ? record.config : {}),
      driverId: record.id,
    })
    await drv.init()
    registerDriver(name, drv)
  }

  await drv.start()

  await db.update(driversTable).set({ enabled: true }).where(eq(driversTable.name, name))
}

export async function stopDriver(name: string) {
  const drv = drivers.get(name)
  if (!drv) throw new Error(`Driver '${name}' not found`)
  await drv.stop()
  await db.update(driversTable).set({ enabled: false }).where(eq(driversTable.name, name))
}

export function getDriverByName(name: string) {
  return drivers.get(name)
}

export async function watchForNewDrivers() {
  const watcher = chokidar.watch('./drivers', { ignoreInitial: true })

  watcher.on('add', async (filepath) => {
    if (!filepath.endsWith('.ts')) return
    const name = path.basename(filepath, '.ts')

    const exists = await db.select().from(driversTable).where(eq(driversTable.name, name))
    if (exists.length > 0) return

    await db.insert(driversTable).values({
      name,
      type: 'custom',
      sourcePath: filepath.replace(/\\/g, '/'),
      uploaded: false,
      enabled: false,
    })

    console.log(`[watcher] New driver detected and added to DB: ${name}`)
  })

  console.log('[watcher] Driver directory watch initialized')
}

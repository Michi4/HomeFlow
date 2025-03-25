import { BaseDriver } from './types'
import path from 'path'
import { pathToFileURL } from 'url'
import fs from 'fs/promises'
import { db } from '../db/client'
import { drivers } from '../db/schema'
import { eq } from 'drizzle-orm'
import { DriverRuntime } from './runtime'
import { registerDriver } from './registry'

export async function loadAndStartAllDrivers() {
  const allDrivers = await db.select().from(drivers).where(eq(drivers.enabled, true))

  for (const drv of allDrivers) {
    if (!drv.sourcePath) {
      console.warn(`[load] skipping driver ${drv.name}: no sourcePath`)
      continue
    }

    try {
      const modulePath = path.resolve(drv.sourcePath)
      const mod = await import(pathToFileURL(modulePath).href)
      const instance = mod.default

      const runtime = new DriverRuntime(instance, {
        ...(typeof drv.config === 'object' && drv.config !== null ? drv.config : {}),
        driverId: drv.id,
      })

      await runtime.init()
      await runtime.start()
      registerDriver(drv.name, runtime)
    } catch (err) {
      console.error(`[load] failed to load ${drv.name}:`, err)
    }
  }
}

export async function loadDriverFromFile(filepath: string): Promise<BaseDriver> {
  const mod = await import(pathToFileURL(path.resolve(filepath)).href)
  const driver = mod.default || mod.driver
  if (!driver || typeof driver.init !== 'function') {
    throw new Error('Invalid driver: missing init()')
  }
  return driver
}

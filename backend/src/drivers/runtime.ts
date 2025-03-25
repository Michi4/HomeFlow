import { BaseDriver, DriverDeviceDefinition } from './types'
import { db } from '../db/client'
import { devices, deviceData, deviceCurrentData, deviceProperties, drivers } from '../db/schema'
import { eq } from 'drizzle-orm'
import fs from 'fs/promises'
import path from 'path'

export type DriverStatus = 'loaded' | 'started' | 'stopped' | 'error'

export class DriverRuntime {
  public status: DriverStatus = 'loaded'
  public readonly instance: BaseDriver
  private config: any
  private intervalId?: NodeJS.Timeout
  private pollInterval: number

  constructor(instance: BaseDriver, config: any, defaultInterval = 10000) {
    this.instance = instance
    this.config = config
    this.pollInterval = config.pollInterval || defaultInterval
  }

  async init() {
    await this.instance.init?.(this.config)
  }

  async start() {
    if (this.status === 'started') return
    await this.instance.start?.()
    await this.ensureDevicesRegistered()

    if (this.instance.poll) {
      this.intervalId = setInterval(async () => {
        try {
          const result = await this.instance.poll?.()
          for (const [deviceId, props] of Object.entries(result ?? {})) {
            for (const [key, value] of Object.entries(props)) {
              const [property] = await db
                .select()
                .from(deviceProperties)
                .where(eq(deviceProperties.key, key))

              if (property) {
                await db.insert(deviceData).values({
                  propertyId: property.id,
                  value: String(value),
                  timestamp: new Date(),
                })

                await db
                  .insert(deviceCurrentData)
                  .values({
                    propertyId: property.id,
                    value: String(value),
                    updatedAt: new Date(),
                  })
                  .onConflictDoUpdate({
                    target: deviceCurrentData.propertyId,
                    set: {
                      value: String(value),
                      updatedAt: new Date(),
                    },
                  })
              }
            }
          }
        } catch (e) {
          console.error(`[${this.instance.name}] Poll error:`, e)
        }
      }, this.pollInterval)
    }

    this.status = 'started'
  }

  async stop() {
    await this.instance.stop?.()
    if (this.intervalId) clearInterval(this.intervalId)
    this.status = 'stopped'
  }

  async destroy() {
    await this.stop()
    await this.instance.destroy?.()
    this.status = 'loaded'
  }

  async reload(config?: any) {
    await this.destroy()
    if (config) this.config = config
    await this.init()
    await this.start()
  }

  getStatus() {
    return this.status
  }

  private async ensureDevicesRegistered() {
    if (!this.instance.getDevices) return
    const devicesDefined = await this.instance.getDevices()

    for (const dev of devicesDefined) {
      const [existingDevice] = await db
        .select()
        .from(devices)
        .where(eq(devices.name, dev.name))

      let deviceId: number
      if (!existingDevice) {
        const inserted = await db
          .insert(devices)
          .values({
            name: dev.name,
            type: dev.type,
            config: {},
            driverId: this.config.driverId,
            createdAt: new Date(),
          })
          .returning({ id: devices.id })
        deviceId = inserted[0].id
      } else {
        deviceId = existingDevice.id
      }

      for (const prop of dev.properties) {
        const exists = await db
          .select()
          .from(deviceProperties)
          .where(eq(deviceProperties.deviceId, deviceId))
          .then(rows => rows.find(p => p.key === prop.key))

        if (!exists) {
          await db.insert(deviceProperties).values({
            deviceId,
            key: prop.key,
            valueType: prop.valueType,
            unit: prop.unit,
            writable: prop.writable ?? false,
          })
        }
      }
    }
  }

  // Automatically find new drivers in ./drivers and insert into DB if missing
  static async discoverDrivers(folderPath: string = './drivers') {
    const files = await fs.readdir(folderPath)

    for (const file of files) {
      if (!file.endsWith('.ts') && !file.endsWith('.js')) continue
      const name = path.basename(file, path.extname(file))
      const fullPath = path.join(folderPath, file)

      const [existing] = await db.select().from(drivers).where(eq(drivers.name, name))

      if (!existing) {
        await db.insert(drivers).values({
          name,
          type: 'custom',
          sourcePath: fullPath,
          uploaded: false,
          config: {},
          enabled: false,
        })

        console.log(`[driver discovery] Registered new driver '${name}' at ${fullPath}`)
      }
    }
  }
}
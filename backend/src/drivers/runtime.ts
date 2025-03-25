import { BaseDriver, DriverDeviceDefinition, DriverEvent } from './types'
import { db } from '../db/client'
import {
  devices as devicesTable,
  deviceGroups,
  deviceProperties,
  deviceData,
  deviceCurrentData,
} from '../db/schema'
import { eq } from 'drizzle-orm'

export class DriverRuntime {
  private driver: BaseDriver
  private config: Record<string, any>
  private deviceDefs: DriverDeviceDefinition[] = []
  private eventSubscribers: ((event: DriverEvent) => void)[] = []
  public readonly driverId: number
  public readonly driverType: string

  constructor(driver: BaseDriver, config: Record<string, any>) {
    this.driver = driver
    this.config = config
    this.driverId = config.driverId
    this.driverType = driver.type
  }

  async init() {
    await this.driver.init?.(this.config)
    this.deviceDefs = (await this.driver.getDevices?.()) || []

    for (const def of this.deviceDefs) {
      await this.ensureDeviceInDb(def)
    }

    this.driver.onEvent?.((event) => {
      this.handleEvent(event)
      this.eventSubscribers.forEach((cb) => cb(event))
    })
  }

  async start() {
    await this.driver.start?.()
  }

  async stop() {
    await this.driver.stop?.()
  }

  async reload(config: Record<string, any>) {
    await this.stop()
    await this.driver.init?.(config)
    await this.start()
  }

  subscribeToEvents(cb: (event: DriverEvent) => void) {
    this.eventSubscribers.push(cb)
  }

  async handleEvent(event: DriverEvent) {
    const { deviceId, propertyKey, value, timestamp = new Date() } = event
    if (!deviceId || !propertyKey) return

    const dbDeviceId = await this.ensureDynamicDevice(deviceId, propertyKey, value)
    if (!dbDeviceId) return

    const prop = await db
      .select()
      .from(deviceProperties)
      .where(eq(deviceProperties.deviceId, dbDeviceId))
      .then((props) => props.find((p) => p.key === propertyKey))

    if (!prop) return

    await db.insert(deviceData).values({
      propertyId: prop.id,
      value: String(value),
      timestamp,
    })

    await db.insert(deviceCurrentData)
      .values({
        propertyId: prop.id,
        value: String(value),
        updatedAt: timestamp,
      })
      .onConflictDoUpdate({
        target: deviceCurrentData.propertyId,
        set: {
          value: String(value),
          updatedAt: timestamp,
        },
      })
  }

  private async ensureDeviceInDb(def: DriverDeviceDefinition) {
    const existing = await db
      .select()
      .from(devicesTable)
      .where(eq(devicesTable.name, def.name))

    let deviceId: number
    let groupId: number | null = null

    if (def.group) {
      const existingGroup = await db.select().from(deviceGroups).where(eq(deviceGroups.name, def.group))
      if (existingGroup.length > 0) {
        groupId = existingGroup[0].id
      } else {
        const [createdGroup] = await db.insert(deviceGroups).values({ name: def.group }).returning()
        groupId = createdGroup.id
      }
    }

    if (existing.length === 0) {
      const [created] = await db
        .insert(devicesTable)
        .values({
          name: def.name,
          label: def.label,
          driverId: this.driverId,
          groupId,
          type: def.type,
          config: {},
        })
        .returning()

      deviceId = created.id
    } else {
      deviceId = existing[0].id
    }

    for (const prop of def.properties) {
      const found = await db
        .select()
        .from(deviceProperties)
        .where(
          eq(deviceProperties.deviceId, deviceId)
        )
        .then((props) => props.find((p) => p.key === prop.key))

      if (!found) {
        await db.insert(deviceProperties).values({
          deviceId,
          key: prop.key,
          valueType: prop.valueType,
          writable: prop.writable ?? false,
          unit: prop.unit,
        })
      }
    }
  }

  private async ensureDynamicDevice(id: string, propertyKey: string, value: any): Promise<number | null> {
    let device = await db.select().from(devicesTable).where(eq(devicesTable.name, id))

    if (device.length === 0) {
      const def = this.deviceDefs.find((d) => d.id === id)

      let groupId: number | null = null
      if (def?.group) {
        const existingGroup = await db.select().from(deviceGroups).where(eq(deviceGroups.name, def.group))
        if (existingGroup.length > 0) {
          groupId = existingGroup[0].id
        } else {
          const [createdGroup] = await db.insert(deviceGroups).values({ name: def.group }).returning()
          groupId = createdGroup.id
        }
      }

      const [created] = await db
        .insert(devicesTable)
        .values({
          name: id,
          label: def?.label ?? id,
          driverId: this.driverId,
          groupId,
          type: def?.type ?? 'sensor',
          config: {},
        })
        .returning()
      device = [created]
    }

    const deviceId = device[0].id

    const props = await db
      .select()
      .from(deviceProperties)
      .where(eq(deviceProperties.deviceId, deviceId))

    const propExists = props.some((p) => p.key === propertyKey)

    if (!propExists) {
      await db.insert(deviceProperties).values({
        deviceId,
        key: propertyKey,
        valueType: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string',
        writable: false,
      })
    }

    return deviceId
  }

  async send(key: string, value: any) {
    await this.driver.send?.(key, value)
  }
}

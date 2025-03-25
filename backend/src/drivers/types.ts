export interface BaseDriver {
    name: string
    type: string // 'mqtt', 'rest', 'modbus', etc.
  
    init(config: Record<string, any>): Promise<void> | void
    start(): Promise<void> | void
    stop(): Promise<void> | void
    destroy?(): Promise<void> | void
    poll?(): Promise<Record<string, Record<string, unknown>>> // { deviceId: { key: value } }
    send?(key: string, value: any): Promise<void>
    onEvent?(cb: (event: DriverEvent) => void): void
    getDevices?(): Promise<DriverDeviceDefinition[]>
}
  
export interface DriverEvent {
    deviceId?: string
    propertyKey: string
    value: any
    timestamp?: Date
}
  
export interface DriverDeviceDefinition {
    id: string // unique within driver
    name: string
    type: 'sensor' | 'actor' | 'hybrid'
    label?: string
    properties: {
      key: string
      valueType: 'string' | 'number' | 'boolean'
      unit?: string
      writable?: boolean
    }[]
}
export interface DriverContext {
    getDriver: (type: string) => BaseDriverRuntime | undefined
    subscribeToDriverEvents: (driverType: string, cb: (event: DriverEvent) => void) => void
}
  
export interface BaseDriver {
    name: string
    type: string
  
    init(config: any, context: DriverContext): Promise<void>
    start?(): Promise<void>
    stop?(): Promise<void>
    onEvent(cb: (event: DriverEvent) => void): void
    getDevices(): Promise<DriverDeviceDefinition[]>
    send(key: string, value: any, context: DriverContext): Promise<void>
}
  
export interface BaseDriverRuntime {
    driver: BaseDriver
    config: any
    send(key: string, value: any): Promise<void>
    getDevices(): Promise<DriverDeviceDefinition[]>
}
  
export interface DriverDeviceDefinition {
    id: string
    name: string
    label?: string
    group?: string
    type: 'sensor' | 'actor' | 'hybrid'
    properties: {
      key: string
      valueType: 'string' | 'boolean' | 'number'
      writable?: boolean
      unit?: string
    }[]
    capabilities?: string[]
}
  
export interface DriverEvent {
    deviceId: string
    propertyKey: string
    value: any
    timestamp: Date
}
  
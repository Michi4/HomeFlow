import { BaseDriver, DriverDeviceDefinition, DriverEvent, DriverContext } from './types'

const devices: DriverDeviceDefinition[] = []
let emit: (event: DriverEvent) => void

const tasmotaDriver: BaseDriver = {
  name: 'Tasmota',
  type: 'tasmota',

  async init(_config, context: DriverContext) {
    context.subscribeToDriverEvents('mqtt', (event) => {
      const { deviceId, propertyKey, value } = event
      const topic = deviceId.replace('mqtt:', '')

      if (topic.endsWith('/POWER') || topic.endsWith('/POWER2')) {
        const tasmotaId = `tasmota:${topic}`
        const group = topic.split('/')[1] || 'Tasmota'

        if (!devices.find((d) => d.id === tasmotaId)) {
          devices.push({
            id: tasmotaId,
            name: `Tasmota ${topic}`,
            group,
            type: 'actor',
            capabilities: ['enable', 'disable', 'set'],
            properties: [
              {
                key: 'power',
                valueType: 'boolean',
                writable: true,
              },
            ],
          })
        }

        emit?.({
          deviceId: tasmotaId,
          propertyKey: 'power',
          value: value === 'ON',
          timestamp: new Date(),
        })
      }
    })
  },

  onEvent(cb) {
    emit = cb
  },

  async getDevices() {
    return devices
  },

  async send(deviceKey, value, context: DriverContext) {
    const base = deviceKey.replace('tasmota:', '')
    const cmndTopic = base.replace('stat/', 'cmnd/')
    const mqttRuntime = context.getDriver('mqtt')

    if (!mqttRuntime) {
      throw new Error('MQTT runtime not available')
    }

    await mqttRuntime.send(cmndTopic, value ? 'ON' : 'OFF')
  },
}

export default tasmotaDriver

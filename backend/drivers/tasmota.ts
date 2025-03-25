import { BaseDriver, DriverDeviceDefinition, DriverEvent } from './types'
import { getDriverRuntimeByType, subscribeToDriverEvents } from './registry'

const devices: DriverDeviceDefinition[] = []
let emit: (event: DriverEvent) => void

const tasmotaDriver: BaseDriver = {
  name: 'Tasmota',
  type: 'tasmota',

  async init() {
    subscribeToDriverEvents('mqtt', (event) => {
      const { deviceId, propertyKey, value } = event
      const topic = deviceId.replace('mqtt:', '')

      if (topic.endsWith('/POWER') || topic.endsWith('/POWER2')) {
        const tasmotaId = `tasmota:${topic}`

        if (!devices.find((d) => d.id === tasmotaId)) {
          devices.push({
            id: tasmotaId,
            name: `Tasmota ${topic}`,
            group: topic.split('/')[1] || 'Tasmota',
            type: 'actor',
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

  async send(topicKey, value) {
    const base = topicKey.replace('tasmota:', '')
    const cmndTopic = base.replace('stat/', 'cmnd/')
    const mqttRuntime = getDriverRuntimeByType('mqtt')
    await mqttRuntime?.send(cmndTopic, value ? 'ON' : 'OFF')
  },
}

export default tasmotaDriver

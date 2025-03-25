// backend/src/drivers/mqtt.ts
import mqtt from 'mqtt'
import { BaseDriver, DriverDeviceDefinition, DriverEvent } from './types'

let client: mqtt.MqttClient
let emit: ((event: DriverEvent) => void) | undefined
const devices: DriverDeviceDefinition[] = []

const mqttDriver: BaseDriver = {
  name: 'MQTT',
  type: 'mqtt',

  async init(config) {
    const {
      host = '192.168.1.24',
      port = 1883,
      username = 'mqtt-broker',
      password = 'Ulrike23',
      clientId,
      topics = ['#'],
    } = config

    const url = `mqtt://${host}:${port}`
    client = mqtt.connect(url, { username, password, clientId })

    client.on('connect', () => {
      console.log('[mqtt] Connected to', url)
      for (const topic of topics) {
        client.subscribe(topic)
        console.log('[mqtt] Subscribed to', topic)
      }
    })

    client.on('message', (topic, payload) => {
      const value = payload.toString()
      const deviceId = `mqtt:${topic}`

      const topicParts = topic.split('/')
      const group = topicParts.slice(0, -1).join('/')
      const shortKey = topicParts.at(-1) ?? 'value'

      const label = topicParts
        .slice(-3) // Use last 3 segments
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' > ')

      if (!devices.find((d) => d.id === deviceId)) {
        const def: DriverDeviceDefinition = {
          id: deviceId,
          name: deviceId,
          label,
          group,
          type: 'sensor',
          properties: [
            {
              key: shortKey,
              valueType: 'string',
              writable: topic.startsWith('cmnd/') || topic.includes('/set'),
            },
          ],
        }

        devices.push(def)
      }

      emit?.({
        deviceId,
        propertyKey: shortKey,
        value,
        timestamp: new Date(),
      })
    })
  },

  async start() {},

  async stop() {
    client?.end()
  },

  onEvent(cb) {
    emit = cb
  },

  async getDevices() {
    return devices
  },

  async send(topic, value) {
    client?.publish(topic, String(value))
  },
}

export default mqttDriver

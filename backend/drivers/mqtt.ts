import mqtt from 'mqtt'
import { BaseDriver, DriverDeviceDefinition, DriverEvent } from '../src/drivers/types'

let client: mqtt.MqttClient
const devices: DriverDeviceDefinition[] = []
let emit: ((event: DriverEvent) => void) | undefined

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
      console.log('[mqtt] connected to', url)
      for (const topic of topics) {
        client.subscribe(topic)
        console.log('[mqtt] subscribed to', topic)
      }
    })

    client.on('message', (topic, payload) => {
      const value = payload.toString()
      console.log(`[mqtt] 🔥 Received on ${topic}:`, value) // <--- ADD THIS
      const deviceId = `mqtt:${topic}`

      if (!devices.find((d) => d.id === deviceId)) {
        devices.push({
          id: deviceId,
          name: `MQTT ${topic}`,
          type: 'sensor',
          properties: [
            {
              key: 'value',
              valueType: 'string',
              writable: false,
            },
          ],
        })
      }

      emit?.({
        deviceId,
        propertyKey: 'value',
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

  async send(key, value) {
    // Write to topic directly
    client?.publish(key, String(value))
  },
}

export default mqttDriver

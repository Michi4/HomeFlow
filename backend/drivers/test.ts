import { BaseDriver } from '../src/drivers/types'

let tick = 0

const testDriver: BaseDriver = {
  name: 'TestDriver',
  type: 'test',

  async init(config) {
    console.log('[TestDriver] Initialized with config:', config)
  },

  async start() {
    console.log('[TestDriver] Started')
  },

  async stop() {
    console.log('[TestDriver] Stopped')
  },

  async getDevices() {
    return [
      {
        id: 'test-light',
        name: 'Test Light',
        type: 'actor',
        properties: [
          { key: 'on', valueType: 'boolean', writable: true },
        ],
      },
      {
        id: 'test-sensor',
        name: 'Test Sensor',
        type: 'sensor',
        properties: [
          { key: 'temperature', valueType: 'number', unit: '°C' },
        ],
      },
    ]
  },

  async poll() {
    tick++
    return {
      'test-light': { on: tick % 2 === 0 },
      'test-sensor': { temperature: 20 + Math.random() * 5 },
    }
  },
}

export default testDriver

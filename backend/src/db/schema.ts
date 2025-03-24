// src/db/schema.ts
import {
    pgTable,
    serial,
    text,
    timestamp,
    boolean,
    integer,
    jsonb,
    primaryKey,
  } from 'drizzle-orm/pg-core';
  
  // -----------------------------------------
  // DRIVERS TABLE (like MQTT, Zigbee, etc.)
  // -----------------------------------------
  export const drivers = pgTable('drivers', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(), // e.g. "MQTT", "Fronius"
    type: text('type').notNull(), // e.g. "mqtt", "rest", "zigbee"
    config: jsonb('config').default({}),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  });
  
  // -----------------------------------------
  // DEVICE GROUPS
  // -----------------------------------------
  export const deviceGroups = pgTable('device_groups', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  });
  
  // -----------------------------------------
  // DEVICES
  // -----------------------------------------
  export const devices = pgTable('devices', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    driverId: integer('driver_id'),
    groupId: integer('group_id'),
    type: text('type').notNull(), // 'sensor', 'actor', 'hybrid'
    config: jsonb('config').default({}),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  });
  
  // -----------------------------------------
  // DEVICE PROPERTIES
  // -----------------------------------------
  export const deviceProperties = pgTable('device_properties', {
    id: serial('id').primaryKey(),
    deviceId: integer('device_id').notNull(),
    key: text('key').notNull(),
    valueType: text('value_type').notNull(), // 'number', 'boolean', 'string'
    writable: boolean('writable').default(false),
    unit: text('unit'),
  });
  
  // -----------------------------------------
  // DEVICE DATA (historical) - hypertable
  // -----------------------------------------
  export const deviceData = pgTable('device_data', {
    id: serial('id').primaryKey(),
    propertyId: integer('property_id').notNull(),
    value: text('value').notNull(),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
  });
  
  // -----------------------------------------
  // DEVICE CURRENT DATA (latest snapshot)
  // -----------------------------------------
  export const deviceCurrentData = pgTable('device_current_data', {
    propertyId: integer('property_id').primaryKey(),
    value: text('value').notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  });
  
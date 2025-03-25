// backend/src/db/schema.ts
import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  // If you want to keep the unique/foreignKey helpers, you can import them:
  // uniqueIndex,
  // foreignKey,
} from 'drizzle-orm/pg-core'

//
// -----------------------------------------
// BETTER AUTH TABLES (commented out for now)
// -----------------------------------------
// 
// export const user = pgTable('user', {
//   id: text('id').primaryKey(),
//   name: text('name'),
//   email: text('email').notNull().unique(),
//   emailVerified: timestamp('email_verified'),
//   image: text('image'),
//   createdAt: timestamp('created_at').defaultNow().notNull(),
//   updatedAt: timestamp('updated_at').defaultNow().notNull(),
// })
//
// export const session = pgTable('session', {
//   id: text('id').primaryKey(),
//   expiresAt: timestamp('expires_at').notNull(),
//   token: text('token').notNull().unique(),
//   createdAt: timestamp('created_at').defaultNow().notNull(),
//   updatedAt: timestamp('updated_at').defaultNow().notNull(),
//   ipAddress: text('ip_address'),
//   userAgent: text('user_agent'),
//   userId: text('user_id')
//     .notNull()
//     .references(() => user.id, { onDelete: 'cascade' }),
// })
//
// export const account = pgTable('account', {
//   id: text('id').primaryKey(),
//   accountId: text('account_id').notNull(),
//   providerId: text('provider_id').notNull(),
//   userId: text('user_id')
//     .notNull()
//     .references(() => user.id, { onDelete: 'cascade' }),
//   accessToken: text('access_token'),
//   refreshToken: text('refresh_token'),
//   idToken: text('id_token'),
//   accessTokenExpiresAt: timestamp('access_token_expires_at'),
//   refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
//   scope: text('scope'),
//   password: text('password'),
//   createdAt: timestamp('created_at').defaultNow().notNull(),
//   updatedAt: timestamp('updated_at').defaultNow().notNull(),
// })
//
// export const verification = pgTable('verification', {
//   id: text('id').primaryKey(),
//   identifier: text('identifier').notNull(),
//   value: text('value').notNull(),
//   expiresAt: timestamp('expires_at').notNull(),
//   createdAt: timestamp('created_at').defaultNow(),
//   updatedAt: timestamp('updated_at').defaultNow(),
// })

// -----------------------------------------
// DRIVERS TABLE
// -----------------------------------------
export const drivers = pgTable('drivers', {
  id: serial('id').primaryKey(),

  name: text('name').notNull(),                   // Display name
  type: text('type').notNull(),                   // 'mqtt', 'rest', etc.
  config: jsonb('config').default({}),            // Editable in UI (raw JSON)
  enabled: boolean('enabled').default(true),      // Start on boot if true

  pollInterval: integer('poll_interval'),         // Optional override per driver
  sourcePath: text('source_path'),                // E.g. './drivers/user-mqtt.ts'
  uploaded: boolean('uploaded').default(false),   // Was it uploaded or built-in?

  description: text('description'),               // Optional
  icon: text('icon'),                             // Emoji or string
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// -----------------------------------------
// DEVICE GROUPS
// -----------------------------------------
export const deviceGroups = pgTable('device_groups', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// -----------------------------------------
// DEVICES
// -----------------------------------------
export const devices = pgTable('devices', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  label: text('label'),
  driverId: integer('driver_id'),
  groupId: integer('group_id'),
  type: text('type').notNull(), // 'sensor', 'actor', 'hybrid'
  config: jsonb('config').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

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
})

// -----------------------------------------
// DEVICE DATA (historical) - hypertable
// -----------------------------------------
export const deviceData = pgTable('device_data', {
  id: serial('id').primaryKey(),
  propertyId: integer('property_id').notNull(),
  value: text('value').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
})

// -----------------------------------------
// DEVICE CURRENT DATA (latest snapshot)
// -----------------------------------------
export const deviceCurrentData = pgTable('device_current_data', {
  propertyId: integer('property_id').primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

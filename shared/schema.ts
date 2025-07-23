import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'solar', 'heatpump', 'charger'
  address: text("address").notNull(),
  port: integer("port").notNull().default(502),
  isOnline: boolean("is_online").notNull().default(false),
  lastSeen: timestamp("last_seen"),
});

export const energyData = pgTable("energy_data", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").references(() => devices.id),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  power: real("power").notNull(), // kW
  voltage: real("voltage"),
  current: real("current"),
  temperature: real("temperature"),
  efficiency: real("efficiency"),
});

export const systemControls = pgTable("system_controls", {
  id: serial("id").primaryKey(),
  autoMode: boolean("auto_mode").notNull().default(true),
  gridExport: boolean("grid_export").notNull().default(false),
  emergencyStop: boolean("emergency_stop").notNull().default(false),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  deviceId: integer("device_id").references(() => devices.id),
  type: text("type").notNull(), // 'info', 'warning', 'error', 'success'
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertDeviceSchema = createInsertSchema(devices).pick({
  name: true,
  type: true,
  address: true,
  port: true,
});

export const insertEnergyDataSchema = createInsertSchema(energyData).pick({
  deviceId: true,
  power: true,
  voltage: true,
  current: true,
  temperature: true,
  efficiency: true,
});

export const insertSystemControlsSchema = createInsertSchema(systemControls).pick({
  autoMode: true,
  gridExport: true,
  emergencyStop: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLog).pick({
  message: true,
  deviceId: true,
  type: true,
});

export type Device = typeof devices.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type EnergyData = typeof energyData.$inferSelect;
export type InsertEnergyData = z.infer<typeof insertEnergyDataSchema>;
export type SystemControls = typeof systemControls.$inferSelect;
export type InsertSystemControls = z.infer<typeof insertSystemControlsSchema>;
export type ActivityLogEntry = typeof activityLog.$inferSelect;
export type InsertActivityLogEntry = z.infer<typeof insertActivityLogSchema>;

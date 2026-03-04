import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  datetime,
  json,
  index,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with role-based access control for Owner and Staff.
 */
export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    email: varchar("email", { length: 320 }),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: mysqlEnum("role", ["user", "admin", "owner", "staff"]).default("user").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  (table) => ({
    roleIdx: index("role_idx").on(table.role),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Orders table for managing Meesho seller orders
 */
export const orders = mysqlTable(
  "orders",
  {
    id: int("id").autoincrement().primaryKey(),
    orderId: varchar("orderId", { length: 64 }).notNull().unique(),
    customerId: varchar("customerId", { length: 64 }).notNull(),
    customerName: varchar("customerName", { length: 255 }).notNull(),
    customerEmail: varchar("customerEmail", { length: 320 }),
    customerPhone: varchar("customerPhone", { length: 20 }),
    totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
    discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }).default("0"),
    taxAmount: decimal("taxAmount", { precision: 10, scale: 2 }).default("0"),
    netAmount: decimal("netAmount", { precision: 10, scale: 2 }).notNull(),
    status: mysqlEnum("status", [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
      "returned",
    ])
      .default("pending")
      .notNull(),
    shippingAddress: text("shippingAddress"),
    state: varchar("state", { length: 50 }),
    city: varchar("city", { length: 100 }),
    pincode: varchar("pincode", { length: 10 }),
    items: json("items").$type<Array<{ skuId: number; quantity: number; price: number }>>(),
    notes: text("notes"),
    isDuplicate: boolean("isDuplicate").default(false),
    duplicateOf: int("duplicateOf"),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    orderIdIdx: index("orderId_idx").on(table.orderId),
    statusIdx: index("status_idx").on(table.status),
    stateIdx: index("state_idx").on(table.state),
    createdAtIdx: index("createdAt_idx").on(table.createdAt),
  })
);

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Inventory and SKU tracking table
 */
export const inventory = mysqlTable(
  "inventory",
  {
    id: int("id").autoincrement().primaryKey(),
    skuId: varchar("skuId", { length: 64 }).notNull().unique(),
    productName: varchar("productName", { length: 255 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 100 }),
    quantity: int("quantity").notNull().default(0),
    minimumStock: int("minimumStock").notNull().default(10),
    maximumStock: int("maximumStock"),
    costPrice: decimal("costPrice", { precision: 10, scale: 2 }).notNull(),
    sellingPrice: decimal("sellingPrice", { precision: 10, scale: 2 }).notNull(),
    unit: varchar("unit", { length: 20 }).default("piece"),
    barcode: varchar("barcode", { length: 100 }),
    imageUrl: varchar("imageUrl", { length: 500 }),
    isActive: boolean("isActive").default(true),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    skuIdIdx: index("skuId_idx").on(table.skuId),
    categoryIdx: index("category_idx").on(table.category),
  })
);

export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = typeof inventory.$inferInsert;

/**
 * Stock movement history for tracking inventory changes
 */
export const stockMovement = mysqlTable(
  "stockMovement",
  {
    id: int("id").autoincrement().primaryKey(),
    skuId: int("skuId").notNull(),
    movementType: mysqlEnum("movementType", ["in", "out", "adjustment", "return"]).notNull(),
    quantity: int("quantity").notNull(),
    reason: varchar("reason", { length: 255 }),
    orderId: int("orderId"),
    notes: text("notes"),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    skuIdIdx: index("skuId_idx").on(table.skuId),
    createdAtIdx: index("createdAt_idx").on(table.createdAt),
  })
);

export type StockMovement = typeof stockMovement.$inferSelect;
export type InsertStockMovement = typeof stockMovement.$inferInsert;

/**
 * Shipping labels table
 */
export const shippingLabels = mysqlTable(
  "shippingLabels",
  {
    id: int("id").autoincrement().primaryKey(),
    orderId: int("orderId").notNull(),
    trackingNumber: varchar("trackingNumber", { length: 100 }).unique(),
    carrier: varchar("carrier", { length: 50 }),
    labelUrl: varchar("labelUrl", { length: 500 }),
    templateId: int("templateId"),
    recipientName: varchar("recipientName", { length: 255 }).notNull(),
    recipientAddress: text("recipientAddress").notNull(),
    recipientPhone: varchar("recipientPhone", { length: 20 }),
    weight: decimal("weight", { precision: 8, scale: 2 }),
    dimensions: json("dimensions").$type<{ length: number; width: number; height: number }>(),
    status: mysqlEnum("status", ["generated", "printed", "shipped", "delivered"]).default("generated"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    orderIdIdx: index("orderId_idx").on(table.orderId),
    trackingIdx: index("tracking_idx").on(table.trackingNumber),
  })
);

export type ShippingLabel = typeof shippingLabels.$inferSelect;
export type InsertShippingLabel = typeof shippingLabels.$inferInsert;

/**
 * Shipping label templates for customization
 */
export const labelTemplates = mysqlTable(
  "labelTemplates",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    templateContent: json("templateContent").$type<Record<string, unknown>>(),
    isDefault: boolean("isDefault").default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  }
);

export type LabelTemplate = typeof labelTemplates.$inferSelect;
export type InsertLabelTemplate = typeof labelTemplates.$inferInsert;

/**
 * Reports table for storing generated reports
 */
export const reports = mysqlTable(
  "reports",
  {
    id: int("id").autoincrement().primaryKey(),
    reportType: mysqlEnum("reportType", [
      "profit_loss",
      "state_wise",
      "performance",
      "inventory",
    ]).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    startDate: datetime("startDate").notNull(),
    endDate: datetime("endDate").notNull(),
    data: json("data").$type<Record<string, unknown>>(),
    summary: json("summary").$type<Record<string, unknown>>(),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    reportTypeIdx: index("reportType_idx").on(table.reportType),
    createdAtIdx: index("createdAt_idx").on(table.createdAt),
  })
);

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

/**
 * Support tickets table
 */
export const supportTickets = mysqlTable(
  "supportTickets",
  {
    id: int("id").autoincrement().primaryKey(),
    ticketNumber: varchar("ticketNumber", { length: 50 }).notNull().unique(),
    orderId: int("orderId"),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    category: varchar("category", { length: 50 }).notNull(),
    priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
    status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed", "reopen"])
      .default("open")
      .notNull(),
    assignedTo: int("assignedTo"),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    resolvedAt: timestamp("resolvedAt"),
  },
  (table) => ({
    ticketNumberIdx: index("ticketNumber_idx").on(table.ticketNumber),
    statusIdx: index("status_idx").on(table.status),
    priorityIdx: index("priority_idx").on(table.priority),
  })
);

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;

/**
 * Ticket comments/replies
 */
export const ticketComments = mysqlTable(
  "ticketComments",
  {
    id: int("id").autoincrement().primaryKey(),
    ticketId: int("ticketId").notNull(),
    comment: text("comment").notNull(),
    attachmentUrl: varchar("attachmentUrl", { length: 500 }),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    ticketIdIdx: index("ticketId_idx").on(table.ticketId),
  })
);

export type TicketComment = typeof ticketComments.$inferSelect;
export type InsertTicketComment = typeof ticketComments.$inferInsert;

/**
 * Offline sync queue for PWA functionality
 */
export const offlineSyncQueue = mysqlTable(
  "offlineSyncQueue",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    action: varchar("action", { length: 50 }).notNull(), // "create", "update", "delete"
    entityType: varchar("entityType", { length: 50 }).notNull(), // "order", "inventory", etc.
    entityId: int("entityId"),
    data: json("data").$type<Record<string, unknown>>(),
    synced: boolean("synced").default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    syncedAt: timestamp("syncedAt"),
  },
  (table) => ({
    userIdIdx: index("userId_idx").on(table.userId),
    syncedIdx: index("synced_idx").on(table.synced),
  })
);

export type OfflineSyncQueue = typeof offlineSyncQueue.$inferSelect;
export type InsertOfflineSyncQueue = typeof offlineSyncQueue.$inferInsert;

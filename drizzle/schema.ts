import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin", "owner", "staff"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
]);
export const stockMovementTypeEnum = pgEnum("stock_movement_type", ["in", "out", "adjustment", "return"]);
export const shippingLabelStatusEnum = pgEnum("shipping_label_status", ["generated", "printed", "shipped", "delivered"]);
export const reportTypeEnum = pgEnum("report_type", [
  "profit_loss",
  "state_wise",
  "performance",
  "inventory",
]);
export const ticketPriorityEnum = pgEnum("ticket_priority", ["low", "medium", "high", "urgent"]);
export const ticketStatusEnum = pgEnum("ticket_status", ["open", "in_progress", "resolved", "closed", "reopen"]);

/**
 * Core user table backing auth flow.
 * Extended with role-based access control for Owner and Staff.
 */
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    email: varchar("email", { length: 320 }),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: userRoleEnum("role").default("user").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  (table) => ({
    roleIdx: index("users_role_idx").on(table.role),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Orders table for managing Meesho seller orders
 */
export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    orderId: varchar("orderId", { length: 64 }).notNull().unique(),
    customerId: varchar("customerId", { length: 64 }).notNull(),
    customerName: varchar("customerName", { length: 255 }).notNull(),
    customerEmail: varchar("customerEmail", { length: 320 }),
    customerPhone: varchar("customerPhone", { length: 20 }),
    totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
    discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }).default("0"),
    taxAmount: decimal("taxAmount", { precision: 10, scale: 2 }).default("0"),
    netAmount: decimal("netAmount", { precision: 10, scale: 2 }).notNull(),
    status: orderStatusEnum("status")
      .default("pending")
      .notNull(),
    shippingAddress: text("shippingAddress"),
    state: varchar("state", { length: 50 }),
    city: varchar("city", { length: 100 }),
    pincode: varchar("pincode", { length: 10 }),
    items: jsonb("items").$type<Array<{ skuId: number; quantity: number; price: number }>>(),
    notes: text("notes"),
    isDuplicate: boolean("isDuplicate").default(false),
    duplicateOf: integer("duplicateOf"),
    createdBy: integer("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    orderIdIdx: index("orders_orderId_idx").on(table.orderId),
    statusIdx: index("orders_status_idx").on(table.status),
    stateIdx: index("orders_state_idx").on(table.state),
    createdAtIdx: index("orders_createdAt_idx").on(table.createdAt),
  })
);

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Inventory and SKU tracking table
 */
export const inventory = pgTable(
  "inventory",
  {
    id: serial("id").primaryKey(),
    skuId: varchar("skuId", { length: 64 }).notNull().unique(),
    productName: varchar("productName", { length: 255 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 100 }),
    quantity: integer("quantity").notNull().default(0),
    minimumStock: integer("minimumStock").notNull().default(10),
    maximumStock: integer("maximumStock"),
    costPrice: decimal("costPrice", { precision: 10, scale: 2 }).notNull(),
    sellingPrice: decimal("sellingPrice", { precision: 10, scale: 2 }).notNull(),
    unit: varchar("unit", { length: 20 }).default("piece"),
    barcode: varchar("barcode", { length: 100 }),
    imageUrl: varchar("imageUrl", { length: 500 }),
    isActive: boolean("isActive").default(true),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    skuIdIdx: index("inventory_skuId_idx").on(table.skuId),
    categoryIdx: index("inventory_category_idx").on(table.category),
  })
);

export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = typeof inventory.$inferInsert;

/**
 * Stock movement history for tracking inventory changes
 */
export const stockMovement = pgTable(
  "stockMovement",
  {
    id: serial("id").primaryKey(),
    skuId: integer("skuId").notNull(),
    movementType: stockMovementTypeEnum("movementType").notNull(),
    quantity: integer("quantity").notNull(),
    reason: varchar("reason", { length: 255 }),
    orderId: integer("orderId"),
    notes: text("notes"),
    createdBy: integer("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    skuIdIdx: index("stockMovement_skuId_idx").on(table.skuId),
    createdAtIdx: index("stockMovement_createdAt_idx").on(table.createdAt),
  })
);

export type StockMovement = typeof stockMovement.$inferSelect;
export type InsertStockMovement = typeof stockMovement.$inferInsert;

/**
 * Shipping labels table
 */
export const shippingLabels = pgTable(
  "shippingLabels",
  {
    id: serial("id").primaryKey(),
    orderId: integer("orderId").notNull(),
    trackingNumber: varchar("trackingNumber", { length: 100 }).unique(),
    carrier: varchar("carrier", { length: 50 }),
    labelUrl: varchar("labelUrl", { length: 500 }),
    templateId: integer("templateId"),
    recipientName: varchar("recipientName", { length: 255 }).notNull(),
    recipientAddress: text("recipientAddress").notNull(),
    recipientPhone: varchar("recipientPhone", { length: 20 }),
    weight: decimal("weight", { precision: 8, scale: 2 }),
    dimensions: jsonb("dimensions").$type<{ length: number; width: number; height: number }>(),
    status: shippingLabelStatusEnum("status").default("generated"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    orderIdIdx: index("shippingLabels_orderId_idx").on(table.orderId),
    trackingIdx: index("shippingLabels_tracking_idx").on(table.trackingNumber),
  })
);

export type ShippingLabel = typeof shippingLabels.$inferSelect;
export type InsertShippingLabel = typeof shippingLabels.$inferInsert;

/**
 * Shipping label templates for customization
 */
export const labelTemplates = pgTable(
  "labelTemplates",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    templateContent: jsonb("templateContent").$type<Record<string, unknown>>(),
    isDefault: boolean("isDefault").default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  }
);

export type LabelTemplate = typeof labelTemplates.$inferSelect;
export type InsertLabelTemplate = typeof labelTemplates.$inferInsert;

/**
 * Reports table for storing generated reports
 */
export const reports = pgTable(
  "reports",
  {
    id: serial("id").primaryKey(),
    reportType: reportTypeEnum("reportType").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    startDate: timestamp("startDate").notNull(),
    endDate: timestamp("endDate").notNull(),
    data: jsonb("data").$type<Record<string, unknown>>(),
    summary: jsonb("summary").$type<Record<string, unknown>>(),
    createdBy: integer("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    reportTypeIdx: index("reports_reportType_idx").on(table.reportType),
    createdAtIdx: index("reports_createdAt_idx").on(table.createdAt),
  })
);

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

/**
 * Support tickets table
 */
export const supportTickets = pgTable(
  "supportTickets",
  {
    id: serial("id").primaryKey(),
    ticketNumber: varchar("ticketNumber", { length: 50 }).notNull().unique(),
    orderId: integer("orderId"),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    category: varchar("category", { length: 50 }).notNull(),
    priority: ticketPriorityEnum("priority").default("medium"),
    status: ticketStatusEnum("status")
      .default("open")
      .notNull(),
    assignedTo: integer("assignedTo"),
    createdBy: integer("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
    resolvedAt: timestamp("resolvedAt"),
  },
  (table) => ({
    ticketNumberIdx: index("supportTickets_ticketNumber_idx").on(table.ticketNumber),
    statusIdx: index("supportTickets_status_idx").on(table.status),
    priorityIdx: index("supportTickets_priority_idx").on(table.priority),
  })
);

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;

/**
 * Ticket comments/replies
 */
export const ticketComments = pgTable(
  "ticketComments",
  {
    id: serial("id").primaryKey(),
    ticketId: integer("ticketId").notNull(),
    comment: text("comment").notNull(),
    attachmentUrl: varchar("attachmentUrl", { length: 500 }),
    createdBy: integer("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    ticketIdIdx: index("ticketComments_ticketId_idx").on(table.ticketId),
  })
);

export type TicketComment = typeof ticketComments.$inferSelect;
export type InsertTicketComment = typeof ticketComments.$inferInsert;

/**
 * Offline sync queue for PWA functionality
 */
export const offlineSyncQueue = pgTable(
  "offlineSyncQueue",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull(),
    action: varchar("action", { length: 50 }).notNull(), // "create", "update", "delete"
    entityType: varchar("entityType", { length: 50 }).notNull(), // "order", "inventory", etc.
    entityId: integer("entityId"),
    data: jsonb("data").$type<Record<string, unknown>>(),
    synced: boolean("synced").default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    syncedAt: timestamp("syncedAt"),
  },
  (table) => ({
    userIdIdx: index("offlineSyncQueue_userId_idx").on(table.userId),
    syncedIdx: index("offlineSyncQueue_synced_idx").on(table.synced),
  })
);

export type OfflineSyncQueue = typeof offlineSyncQueue.$inferSelect;
export type InsertOfflineSyncQueue = typeof offlineSyncQueue.$inferInsert;

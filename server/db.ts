import { eq, and, desc, gte, lte, like, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  orders,
  inventory,
  stockMovement,
  shippingLabels,
  supportTickets,
  ticketComments,
  reports,
  offlineSyncQueue,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// ORDER QUERIES
// ============================================================================

export async function createOrder(orderData: typeof orders.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(orders).values(orderData);
  return result;
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0];
}

export async function getOrderByOrderId(orderId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(orders).where(eq(orders.orderId, orderId)).limit(1);
  return result[0];
}

export async function listOrders(filters?: {
  status?: string;
  state?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [];

  if (filters?.status) {
    conditions.push(eq(orders.status, filters.status as any));
  }
  if (filters?.state) {
    conditions.push(eq(orders.state, filters.state));
  }
  if (filters?.startDate) {
    conditions.push(gte(orders.createdAt, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(orders.createdAt, filters.endDate));
  }

  let query = db.select().from(orders);

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  query = query.orderBy(desc(orders.createdAt)) as any;

  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  if (filters?.offset) {
    query = query.offset(filters.offset) as any;
  }

  return query;
}

export async function updateOrder(id: number, data: Partial<typeof orders.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(orders).set(data).where(eq(orders.id, id));
}

export async function deleteOrder(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.delete(orders).where(eq(orders.id, id));
}

export async function checkDuplicateOrder(customerId: string, totalAmount: number, timeWindowMinutes = 60) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const timeWindow = new Date(Date.now() - timeWindowMinutes * 60 * 1000);

  const result = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.customerId, customerId),
        eq(orders.totalAmount, totalAmount.toString()),
        gte(orders.createdAt, timeWindow)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// ============================================================================
// INVENTORY QUERIES
// ============================================================================

export async function createInventory(inventoryData: typeof inventory.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(inventory).values(inventoryData);
}

export async function getInventoryBySku(skuId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(inventory).where(eq(inventory.skuId, skuId)).limit(1);
  return result[0];
}

export async function listInventory(filters?: { category?: string; isActive?: boolean; limit?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [];

  if (filters?.category) {
    conditions.push(eq(inventory.category, filters.category));
  }
  if (filters?.isActive !== undefined) {
    conditions.push(eq(inventory.isActive, filters.isActive));
  }

  let query = db.select().from(inventory);

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }

  return query;
}

export async function updateInventory(id: number, data: Partial<typeof inventory.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(inventory).set(data).where(eq(inventory.id, id));
}

export async function updateInventoryQuantity(id: number, quantityChange: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const item = await db.select().from(inventory).where(eq(inventory.id, id)).limit(1);
  if (!item[0]) throw new Error("Inventory item not found");

  const newQuantity = Math.max(0, (item[0].quantity || 0) + quantityChange);

  return db
    .update(inventory)
    .set({ quantity: newQuantity })
    .where(eq(inventory.id, id));
}

export async function getLowStockItems(limit = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(inventory)
    .where(eq(inventory.isActive, true))
    .limit(limit);
}

// ============================================================================
// SUPPORT TICKET QUERIES
// ============================================================================

export async function createTicket(ticketData: typeof supportTickets.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(supportTickets).values(ticketData);
}

export async function getTicketById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(supportTickets).where(eq(supportTickets.id, id)).limit(1);
  return result[0];
}

export async function listTickets(filters?: {
  status?: string;
  priority?: string;
  assignedTo?: number;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [];

  if (filters?.status) {
    conditions.push(eq(supportTickets.status, filters.status as any));
  }
  if (filters?.priority) {
    conditions.push(eq(supportTickets.priority, filters.priority as any));
  }
  if (filters?.assignedTo) {
    conditions.push(eq(supportTickets.assignedTo, filters.assignedTo));
  }

  let query = db.select().from(supportTickets);

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  query = query.orderBy(desc(supportTickets.createdAt)) as any;

  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  if (filters?.offset) {
    query = query.offset(filters.offset) as any;
  }

  return query;
}

export async function updateTicket(id: number, data: Partial<typeof supportTickets.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(supportTickets).set(data).where(eq(supportTickets.id, id));
}

export async function addTicketComment(commentData: typeof ticketComments.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(ticketComments).values(commentData);
}

export async function getTicketComments(ticketId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(ticketComments).where(eq(ticketComments.ticketId, ticketId));
}

// ============================================================================
// OFFLINE SYNC QUERIES
// ============================================================================

export async function addToSyncQueue(syncData: typeof offlineSyncQueue.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(offlineSyncQueue).values(syncData);
}

export async function getPendingSyncItems(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(offlineSyncQueue)
    .where(and(eq(offlineSyncQueue.userId, userId), eq(offlineSyncQueue.synced, false)));
}

export async function markSyncItemAsSynced(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(offlineSyncQueue)
    .set({ synced: true, syncedAt: new Date() })
    .where(eq(offlineSyncQueue.id, id));
}

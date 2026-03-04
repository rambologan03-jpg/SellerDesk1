import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

// ============================================================================
// ORDER ROUTER
// ============================================================================

const orderRouter = router({
  // List orders with filtering
  list: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        state: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const orders = await db.listOrders({
        status: input.status,
        state: input.state,
        startDate: input.startDate,
        endDate: input.endDate,
        limit: input.limit,
        offset: input.offset,
      });
      return orders;
    }),

  // Get single order
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const order = await db.getOrderById(input.id);
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }
      return order;
    }),

  // Create order with duplicate detection
  create: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        customerId: z.string(),
        customerName: z.string(),
        customerEmail: z.string().email().optional(),
        customerPhone: z.string().optional(),
        totalAmount: z.string(),
        discountAmount: z.string().optional(),
        taxAmount: z.string().optional(),
        netAmount: z.string(),
        status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled", "returned"]),
        shippingAddress: z.string().optional(),
        state: z.string().optional(),
        city: z.string().optional(),
        pincode: z.string().optional(),
        items: z.array(z.object({ skuId: z.number(), quantity: z.number(), price: z.number() })).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check for duplicate order
      const duplicate = await db.checkDuplicateOrder(
        input.customerId,
        parseFloat(input.totalAmount),
        60 // 60 minute window
      );

      if (duplicate) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Duplicate order detected. Similar order found within the last hour.",
        });
      }

      const result = await db.createOrder({
        orderId: input.orderId,
        customerId: input.customerId,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        totalAmount: input.totalAmount,
        discountAmount: input.discountAmount || "0",
        taxAmount: input.taxAmount || "0",
        netAmount: input.netAmount,
        status: input.status,
        shippingAddress: input.shippingAddress,
        state: input.state,
        city: input.city,
        pincode: input.pincode,
        items: input.items,
        notes: input.notes,
        createdBy: ctx.user.id,
      });

      return result;
    }),

  // Update order
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled", "returned"]).optional(),
        notes: z.string().optional(),
        shippingAddress: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db.updateOrder(input.id, {
        status: input.status,
        notes: input.notes,
        shippingAddress: input.shippingAddress,
      });
      return result;
    }),

  // Delete order
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const result = await db.deleteOrder(input.id);
      return result;
    }),

  // Check for duplicate
  checkDuplicate: protectedProcedure
    .input(
      z.object({
        customerId: z.string(),
        totalAmount: z.number(),
        timeWindowMinutes: z.number().default(60),
      })
    )
    .query(async ({ input }) => {
      const duplicate = await db.checkDuplicateOrder(
        input.customerId,
        input.totalAmount,
        input.timeWindowMinutes
      );
      return { isDuplicate: !!duplicate, order: duplicate };
    }),
});

// ============================================================================
// INVENTORY ROUTER
// ============================================================================

const inventoryRouter = router({
  // List inventory
  list: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        isActive: z.boolean().optional(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      const items = await db.listInventory({
        category: input.category,
        isActive: input.isActive,
        limit: input.limit,
      });
      return items;
    }),

  // Get single inventory item
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const item = await db.getInventoryBySku(input.id.toString());
      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Inventory item not found" });
      }
      return item;
    }),

  // Create inventory item
  create: protectedProcedure
    .input(
      z.object({
        skuId: z.string(),
        productName: z.string(),
        description: z.string().optional(),
        category: z.string().optional(),
        quantity: z.number().default(0),
        minimumStock: z.number().default(10),
        maximumStock: z.number().optional(),
        costPrice: z.string(),
        sellingPrice: z.string(),
        unit: z.string().default("piece"),
        barcode: z.string().optional(),
        imageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db.createInventory({
        skuId: input.skuId,
        productName: input.productName,
        description: input.description,
        category: input.category,
        quantity: input.quantity,
        minimumStock: input.minimumStock,
        maximumStock: input.maximumStock,
        costPrice: input.costPrice,
        sellingPrice: input.sellingPrice,
        unit: input.unit,
        barcode: input.barcode,
        imageUrl: input.imageUrl,
        isActive: true,
      });
      return result;
    }),

  // Update inventory item
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        productName: z.string().optional(),
        quantity: z.number().optional(),
        minimumStock: z.number().optional(),
        sellingPrice: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db.updateInventory(input.id, {
        productName: input.productName,
        quantity: input.quantity,
        minimumStock: input.minimumStock,
        sellingPrice: input.sellingPrice,
        isActive: input.isActive,
      });
      return result;
    }),

  // Get low stock items
  lowStock: protectedProcedure.query(async () => {
    return db.getLowStockItems(20);
  }),
});

// ============================================================================
// SUPPORT TICKET ROUTER
// ============================================================================

const ticketRouter = router({
  // List tickets
  list: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        priority: z.string().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      return db.listTickets({
        status: input.status,
        priority: input.priority,
        limit: input.limit,
        offset: input.offset,
      });
    }),

  // Get single ticket
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const ticket = await db.getTicketById(input.id);
      if (!ticket) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      }
      return ticket;
    }),

  // Create ticket
  create: protectedProcedure
    .input(
      z.object({
        orderId: z.number().optional(),
        title: z.string(),
        description: z.string(),
        category: z.string(),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const ticketNumber = `TKT-${Date.now()}`;
      const result = await db.createTicket({
        ticketNumber,
        orderId: input.orderId,
        title: input.title,
        description: input.description,
        category: input.category,
        priority: input.priority,
        status: "open",
        createdBy: ctx.user.id,
      });
      return result;
    }),

  // Update ticket
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["open", "in_progress", "resolved", "closed", "reopen"]).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db.updateTicket(input.id, {
        status: input.status,
        priority: input.priority,
        updatedAt: new Date(),
      });
      return result;
    }),

  // Add comment
  addComment: protectedProcedure
    .input(
      z.object({
        ticketId: z.number(),
        comment: z.string(),
        attachmentUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await db.addTicketComment({
        ticketId: input.ticketId,
        comment: input.comment,
        attachmentUrl: input.attachmentUrl,
        createdBy: ctx.user.id,
      });
      return result;
    }),

  // Get comments
  getComments: protectedProcedure
    .input(z.object({ ticketId: z.number() }))
    .query(async ({ input }) => {
      return db.getTicketComments(input.ticketId);
    }),
});

// ============================================================================
// MAIN ROUTER
// ============================================================================

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Feature routers
  orders: orderRouter,
  inventory: inventoryRouter,
  tickets: ticketRouter,
});

export type AppRouter = typeof appRouter;

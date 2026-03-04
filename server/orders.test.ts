import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAuthContext(): { ctx: TrpcContext } {
  const user = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("orders", () => {
  it("should create an order", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orders.create({
      orderId: "ORD-001",
      customerId: "CUST-001",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      customerPhone: "+91 9876543210",
      totalAmount: "1000",
      netAmount: "1000",
      status: "pending",
      state: "Maharashtra",
      city: "Mumbai",
      pincode: "400001",
      shippingAddress: "123 Main St",
    });

    expect(result).toBeDefined();
  });

  it("should detect duplicate orders", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create first order
    await caller.orders.create({
      orderId: "ORD-002",
      customerId: "CUST-002",
      customerName: "Jane Doe",
      totalAmount: "2000",
      netAmount: "2000",
      status: "pending",
    });

    // Try to create duplicate order
    try {
      await caller.orders.create({
        orderId: "ORD-003",
        customerId: "CUST-002",
        customerName: "Jane Doe",
        totalAmount: "2000",
        netAmount: "2000",
        status: "pending",
      });
      expect.fail("Should have thrown error for duplicate order");
    } catch (error: any) {
      expect(error.code).toBe("CONFLICT");
      expect(error.message).toContain("Duplicate order detected");
    }
  });

  it("should list orders", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orders.list({
      limit: 10,
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should check for duplicates", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orders.checkDuplicate({
      customerId: "CUST-999",
      totalAmount: 5000,
      timeWindowMinutes: 60,
    });

    expect(result).toHaveProperty("isDuplicate");
    expect(result).toHaveProperty("order");
  });

  it("should update order status", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create an order first
    const created = await caller.orders.create({
      orderId: "ORD-UPDATE",
      customerId: "CUST-UPDATE",
      customerName: "Update Test",
      totalAmount: "1500",
      netAmount: "1500",
      status: "pending",
    });

    // Update the order
    const result = await caller.orders.update({
      id: (created as any).insertId || 1,
      status: "confirmed",
      notes: "Order confirmed",
    });

    expect(result).toBeDefined();
  });
});

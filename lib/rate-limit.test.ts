import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the Prisma client the limiter depends on.
const { rateLimit } = vi.hoisted(() => ({
  rateLimit: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: { rateLimit } }));

import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts a fresh window when none exists", async () => {
    rateLimit.findUnique.mockResolvedValue(null);
    rateLimit.upsert.mockResolvedValue({});

    const res = await checkRateLimit("key", 5, 60_000);

    expect(res.success).toBe(true);
    expect(res.remaining).toBe(4);
    expect(rateLimit.upsert).toHaveBeenCalledOnce();
  });

  it("increments while under the limit", async () => {
    rateLimit.findUnique.mockResolvedValue({
      key: "key",
      count: 2,
      expiresAt: new Date(Date.now() + 60_000),
    });
    rateLimit.update.mockResolvedValue({ count: 3 });

    const res = await checkRateLimit("key", 5, 60_000);

    expect(res.success).toBe(true);
    expect(res.remaining).toBe(2);
  });

  it("blocks once the limit is reached within the window", async () => {
    rateLimit.findUnique.mockResolvedValue({
      key: "key",
      count: 5,
      expiresAt: new Date(Date.now() + 30_000),
    });

    const res = await checkRateLimit("key", 5, 60_000);

    expect(res.success).toBe(false);
    expect(res.remaining).toBe(0);
    expect(res.retryAfterMs).toBeGreaterThan(0);
    expect(rateLimit.update).not.toHaveBeenCalled();
  });

  it("resets after the window has expired", async () => {
    rateLimit.findUnique.mockResolvedValue({
      key: "key",
      count: 5,
      expiresAt: new Date(Date.now() - 1_000), // expired
    });
    rateLimit.upsert.mockResolvedValue({});

    const res = await checkRateLimit("key", 5, 60_000);

    expect(res.success).toBe(true);
    expect(rateLimit.upsert).toHaveBeenCalledOnce();
  });
});

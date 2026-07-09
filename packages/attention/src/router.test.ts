import { describe, expect, it } from "vitest";
import { routeAttention } from "./router.js";

describe("routeAttention", () => {
  it("returns empty queue for fresh directory", async () => {
    const result = await routeAttention("/tmp/nonexistent-outerloop-" + Date.now());
    expect(result.total).toBe(0);
    expect(result.pending).toEqual([]);
  });
});
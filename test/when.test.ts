import { describe, expect, it, vi } from "vitest";
import { P, when, WhenStatement } from "../src";

describe("when", () => {
  describe("prepare", () => {
    it("base case", () => {
      const f1 = vi.fn();
      const f2 = vi.fn();
      const f3 = vi.fn();

      const whenstmt = WhenStatement.prepare().is(1, f1).is(2, f2).is(3, f3);
      whenstmt.lazy(2);

      expect(f1).not.toHaveBeenCalled();
      expect(f2).toHaveBeenCalledOnce();
      expect(f3).not.toHaveBeenCalled();
    });
  });
});

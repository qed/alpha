import { describe, it, expect } from "vitest";
import { RESERVED_SLUGS } from "@/lib/constants/geographies";

describe("RESERVED_SLUGS", () => {
  it("includes all known reserved path segments", () => {
    expect(RESERVED_SLUGS).toContain("v1");
    expect(RESERVED_SLUGS).toContain("hub");
    expect(RESERVED_SLUGS).toContain("api");
    expect(RESERVED_SLUGS).toContain("privacy");
    expect(RESERVED_SLUGS).toContain("sign-in");
  });
});

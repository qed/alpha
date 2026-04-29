import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@react-email/components";
import { NewProspectEmail } from "@/components/emails/new-prospect-email";

describe("NewProspectEmail", () => {
  it("contains parent first name only (no last name)", async () => {
    const html = await render(
      NewProspectEmail({
        championName: "Champion",
        parentFirstName: "Jane",
        childCount: 2,
        geographyName: "Austin",
        prospectsUrl: "https://example.com/prospects",
      })
    );
    expect(html).toContain("Jane");
    expect(html).not.toContain("Doe");
  });

  it("contains child count and geography name", async () => {
    const html = await render(
      NewProspectEmail({
        championName: "Champion",
        parentFirstName: "Jane",
        childCount: 3,
        geographyName: "Dallas",
        prospectsUrl: "https://example.com/prospects",
      })
    );
    expect(html).toContain("3");
    expect(html).toContain("children");
    expect(html).toContain("Dallas");
  });

  it("contains link to prospects list (not prospect UUID)", async () => {
    const html = await render(
      NewProspectEmail({
        championName: "Champion",
        parentFirstName: "Jane",
        childCount: 1,
        geographyName: "Austin",
        prospectsUrl: "https://example.com/prospects",
      })
    );
    expect(html).toContain("https://example.com/prospects");
    expect(html).not.toMatch(/prospects\/[a-f0-9-]{36}/);
  });

  it("uses singular 'child' for count of 1", async () => {
    const html = await render(
      NewProspectEmail({
        championName: "Champion",
        parentFirstName: "Jane",
        childCount: 1,
        geographyName: "Austin",
        prospectsUrl: "https://example.com/prospects",
      })
    );
    expect(html).toMatch(/1\b[^c]*child\b/);
    expect(html).not.toContain("children");
  });
});

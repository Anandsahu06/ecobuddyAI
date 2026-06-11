import { describe, it, expect } from "vitest";
import { POST } from "./route";

describe("scan-bill route", () => {
  it("should return mock data for natural gas bill", async () => {
    const formData = new FormData();
    const file = new File(["test-content"], "gas-bill.pdf", { type: "application/pdf" });
    formData.append("bill", file);

    const request = new Request("http://localhost/api/scan-bill", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.fallback).toBe(true);
    expect(data.providerName).toBe("Cascade Natural Gas");
    expect(data.utilityType).toBe("Gas");
    expect(data.unit).toBe("Therms");
    expect(data.co2SavedKg).toBeGreaterThan(0);
  });

  it("should return mock data for electric bill by default", async () => {
    const formData = new FormData();
    const file = new File(["test-content"], "utility-invoice.png", { type: "image/png" });
    formData.append("bill", file);

    const request = new Request("http://localhost/api/scan-bill", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.fallback).toBe(true);
    expect(data.providerName).toBe("Green Energy Grid");
    expect(data.utilityType).toBe("Electricity");
    expect(data.unit).toBe("kWh");
  });

  it("should return 400 if no bill is uploaded", async () => {
    const formData = new FormData();
    const request = new Request("http://localhost/api/scan-bill", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe("No bill file was uploaded");
  });
});

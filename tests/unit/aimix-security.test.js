import { describe, expect, it } from "vitest";
import { classifyRequest, detectDataSensitivity, redactSensitiveData, signRequest, verifyRequestSignature } from "../../src/aimix/index.js";

describe("AIMix security", () => {
  it("detects and redacts secrets and PII", () => {
    const text = "email a@example.com key sk-test_12345678901234567890";
    expect(detectDataSensitivity(text).level).toBe("sensitive");
    expect(redactSensitiveData(text)).not.toContain("a@example.com");
    expect(classifyRequest({ messages: [{ role: "user", content: text }] }).privacyLevel).toBe("sensitive");
    expect(classifyRequest({ messages: [{ role: "user", content: text }] }, { privacyLevel: "public" }).privacyLevel).toBe("sensitive");
  });

  it("signs and verifies canonical requests with expiry", () => {
    const input = { timestamp: 1000, method: "POST", pathname: "/v1/chat/completions", body: { model: "x" } };
    const signature = signRequest(input, "secret");
    expect(verifyRequestSignature(input, { secret: "secret", signature, now: 1000 }).valid).toBe(true);
    expect(verifyRequestSignature(input, { secret: "secret", signature, now: 999999 }).reason).toBe("signature_expired");
  });
});

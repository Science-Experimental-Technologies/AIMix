import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export function requestSignaturePayload({ timestamp, method, pathname, body }) {
  const bodyHash = createHash("sha256").update(typeof body === "string" ? body : JSON.stringify(body ?? null)).digest("hex");
  return `${timestamp}\n${String(method).toUpperCase()}\n${pathname}\n${bodyHash}`;
}

export function signRequest(input, secret) {
  return createHmac("sha256", secret).update(requestSignaturePayload(input)).digest("hex");
}

export function verifyRequestSignature(input, { secret, signature, now = Date.now(), maxAgeMs = 300000 } = {}) {
  if (!secret || !signature || !input.timestamp) return { valid: false, reason: "signature_missing" };
  const timestamp = Number(input.timestamp);
  if (!Number.isFinite(timestamp) || Math.abs(now - timestamp) > maxAgeMs) return { valid: false, reason: "signature_expired" };
  const expected = Buffer.from(signRequest(input, secret), "hex");
  let provided;
  try { provided = Buffer.from(signature, "hex"); } catch { return { valid: false, reason: "signature_invalid" }; }
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) return { valid: false, reason: "signature_invalid" };
  return { valid: true, reason: "signature_valid" };
}


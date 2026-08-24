import { describe, expect, it } from "vitest";
import { decodeMessage } from "../../open-sse/utils/cursorProtobuf.js";
import { buildAgentRunFrame, isAgentTextRequest } from "../../open-sse/executors/cursor.js";

const nested = (message, field, index = 0) => decodeMessage(message.get(field)[index].value);
const text = (message, field) => Buffer.from(message.get(field)[0].value).toString("utf8");

describe("Cursor AgentService text contract", () => {
  describe("isAgentTextRequest", () => {
    it("accepts string and text-block conversations", () => {
      expect(isAgentTextRequest({ messages: [
        { role: "system", content: "Be brief." },
        { role: "user", content: [{ type: "text", text: "Hello" }] },
      ] })).toBe(true);
    });

    it("ignores declared tool schemas on otherwise text-only requests", () => {
      expect(isAgentTextRequest({
        messages: [{ role: "user", content: "Hello" }],
        tools: [{ type: "function", function: { name: "lookup" } }],
      })).toBe(true);
    });

    it("rejects structured tool-call and tool-result history", () => {
      expect(isAgentTextRequest({ messages: [
        { role: "assistant", content: null, tool_calls: [{ id: "call-1" }] },
        { role: "tool", tool_call_id: "call-1", content: "done" },
      ] })).toBe(false);
    });

    it("rejects non-text content and missing messages", () => {
      expect(isAgentTextRequest({ messages: [
        { role: "user", content: [{ type: "image_url", image_url: { url: "data:image/png;base64,eA==" } }] },
      ] })).toBe(false);
      expect(isAgentTextRequest({})).toBe(false);
      expect(isAgentTextRequest(null)).toBe(false);
    });
  });

  describe("buildAgentRunFrame", () => {
    const decodeRun = (messages, model = "gpt-5.2") => {
      const frame = buildAgentRunFrame(messages, model);
      expect(frame[0]).toBe(0);
      expect(Buffer.from(frame).readUInt32BE(1)).toBe(frame.length - 5);
      return nested(decodeMessage(frame.subarray(5)), 1);
    };

    it("encodes current user text, system instructions, and requested model", () => {
      const run = decodeRun([
        { role: "system", content: "Be brief." },
        { role: "user", content: "Hello" },
      ], "gpt-5.2");

      expect(text(run, 8)).toBe("Be brief.");
      expect(text(nested(run, 9), 1)).toBe("gpt-5.2");

      const userAction = nested(nested(run, 2), 1);
      const userMessage = nested(userAction, 1);
      expect(text(userMessage, 1)).toBe("Hello");
      expect(text(userMessage, 2)).toMatch(/^[0-9a-f-]{36}$/i);
    });

    it("encodes prior text turns as conversation history", () => {
      const run = decodeRun([
        { role: "user", content: "First" },
        { role: "assistant", content: "Second" },
        { role: "user", content: "Third" },
      ]);
      const userAction = nested(nested(run, 2), 1);
      const history = nested(userAction, 7);

      expect(history.get(1)).toHaveLength(2);
      expect(Buffer.from(history.get(1)[0].value).includes(Buffer.from("First"))).toBe(true);
      expect(Buffer.from(history.get(1)[1].value).includes(Buffer.from("Second"))).toBe(true);
    });

    it("omits optional system and history fields for a first user turn", () => {
      const run = decodeRun([{ role: "user", content: "Hello" }]);
      const userAction = nested(nested(run, 2), 1);
      expect(run.has(8)).toBe(false);
      expect(userAction.has(7)).toBe(false);
    });
  });
});

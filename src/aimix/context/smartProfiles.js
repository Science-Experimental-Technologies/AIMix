const PROFILES = Object.freeze({
  off: { id: "off", name: "Off", instruction: "" },
  terse: {
    id: "terse",
    name: "Terse",
    instruction: "Respond with the minimum wording needed to complete the task. Prefer direct actions, compact facts, and short actionable findings. Preserve code, commands, errors, identifiers, safety warnings, and essential reasoning exactly enough to remain correct. Do not add greetings, progress narration, apologies, or closing summaries unless requested.",
  },
  terse_lite: {
    id: "terse_lite",
    name: "Terse Lite",
    instruction: "Be concise and direct. Remove conversational filler while preserving explanations that materially help the user act safely and correctly.",
  },
  terse_ultra: {
    id: "terse_ultra",
    name: "Terse Ultra",
    instruction: "Use fragments, commands, tables, or code where clearer. Omit all nonessential prose. Never shorten code, errors, security constraints, or destructive-action warnings.",
  },
});

export function listSmartProfiles() {
  return Object.values(PROFILES).map(({ instruction, ...profile }) => ({ ...profile, hasInstruction: Boolean(instruction) }));
}

export function applySmartProfile(messages = [], profileId = "off") {
  const profile = PROFILES[profileId] || PROFILES.off;
  if (!profile.instruction || !Array.isArray(messages)) return { messages, profile: profile.id, applied: false };
  const marker = `[AIMix Smart Profile: ${profile.id}]`;
  const next = messages.map((message) => ({ ...message }));
  const system = next.find((message) => message.role === "system" && typeof message.content === "string");
  if (system) {
    if (!system.content.includes(marker)) system.content = `${system.content}\n\n${marker}\n${profile.instruction}`;
  } else {
    next.unshift({ role: "system", content: `${marker}\n${profile.instruction}` });
  }
  return { messages: next, profile: profile.id, applied: true };
}

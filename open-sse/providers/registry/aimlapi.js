export default {
  id: "aimlapi",
  priority: 68,
  hasFree: true,
  alias: "aimlapi",
  aliases: ["aiml-api"],
  display: {
    name: "AI/ML API",
    icon: "hub",
    color: "#2563EB",
    textIcon: "AI",
    website: "https://aimlapi.com",
    notice: { apiKeyUrl: "https://aimlapi.com/app/keys" },
  },
  category: "apikey",
  authType: "apikey",
  transport: {
    baseUrl: "https://api.aimlapi.com/v1/chat/completions",
    validateUrl: "https://api.aimlapi.com/v1/models",
  },
  models: [
    { id: "openai/gpt-5-chat-latest", name: "GPT-5 Chat Latest" },
    { id: "google/gemma-3-4b-it", name: "Gemma 3 4B IT" },
    { id: "mistralai/Mistral-7B-Instruct-v0.2", name: "Mistral 7B Instruct" },
  ],
  modelsFetcher: { url: "https://api.aimlapi.com/v1/models", type: "openai" },
  passthroughModels: true,
};

export default {
  id: "baseten",
  priority: 66,
  alias: "baseten",
  aliases: ["bt"],
  uiAlias: "bt",
  display: {
    name: "Baseten",
    icon: "deployed_code",
    color: "#111827",
    textIcon: "BT",
    website: "https://baseten.co",
    notice: { apiKeyUrl: "https://app.baseten.co/settings/api_keys" },
  },
  category: "apikey",
  authType: "apikey",
  transport: {
    baseUrl: "https://inference.baseten.co/v1/chat/completions",
    validateUrl: "https://inference.baseten.co/v1/models",
  },
  models: [
    { id: "deepseek-ai/DeepSeek-V4-Pro", name: "DeepSeek V4 Pro" },
  ],
  modelsFetcher: { url: "https://inference.baseten.co/v1/models", type: "openai" },
  passthroughModels: true,
};

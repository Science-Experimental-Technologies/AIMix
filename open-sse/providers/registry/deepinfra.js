export default {
  id: "deepinfra",
  priority: 62,
  hasFree: true,
  alias: "deepinfra",
  aliases: ["di"],
  uiAlias: "di",
  display: {
    name: "DeepInfra",
    icon: "dns",
    color: "#6D28D9",
    textIcon: "DI",
    website: "https://deepinfra.com",
    notice: { apiKeyUrl: "https://deepinfra.com/dash/api_keys" },
  },
  category: "apikey",
  authType: "apikey",
  transport: {
    baseUrl: "https://api.deepinfra.com/v1/openai/chat/completions",
    validateUrl: "https://api.deepinfra.com/v1/openai/models",
  },
  models: [
    { id: "deepseek-ai/DeepSeek-V3", name: "DeepSeek V3" },
    { id: "meta-llama/Llama-3.3-70B-Instruct-Turbo", name: "Llama 3.3 70B Turbo" },
    { id: "Qwen/Qwen3-235B-A22B", name: "Qwen3 235B A22B" },
  ],
  modelsFetcher: { url: "https://api.deepinfra.com/v1/openai/models", type: "openai" },
  passthroughModels: true,
};

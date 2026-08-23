export default {
  id: "modal",
  priority: 67,
  alias: "modal",
  aliases: ["modal-endpoints"],
  display: {
    name: "Modal Endpoints",
    icon: "function",
    color: "#0A0A0A",
    textIcon: "MO",
    website: "https://modal.com",
    notice: { apiKeyUrl: "https://modal.com/settings" },
  },
  category: "apikey",
  authType: "apikey",
  transport: {
    baseUrl: "https://inference.us-west.modal.direct/v1/chat/completions",
    validateUrl: "https://inference.us-west.modal.direct/v1/models",
  },
  models: [],
  modelsFetcher: { url: "https://inference.us-west.modal.direct/v1/models", type: "openai" },
  passthroughModels: true,
};

const api = require("../api/client");

const GET_ROUTES = {
  providers: "/api/providers", models: "/api/v1/models", accounts: "/api/providers",
  workflows: "/api/aimix/assets?type=workflow", agents: "/api/aimix/assets?type=agent",
  usage: "/api/usage/stats", costs: "/api/usage/stats", quota: "/api/providers",
  health: "/api/aimix/doctor", logs: "/api/usage/logs", trace: "/api/aimix/traces",
  doctor: "/api/aimix/doctor", policy: "/api/aimix/assets?type=routing-policy",
  config: "/api/settings", status: "/api/aimix/doctor", benchmark: "/api/aimix/assets?type=benchmark",
  replay: "/api/aimix/traces", memory: "/api/aimix/assets?type=memory-policy",
};

async function run(command, args = []) {
  const portArg = args.indexOf("--port"); const port = portArg >= 0 ? Number(args[portArg + 1]) || 20128 : 20128;
  api.configure({ host: "127.0.0.1", port });
  const route = GET_ROUTES[command];
  if (!route) { console.error(`Unknown AIMix command: ${command}`); return 2; }
  const response = await api.makeRequest("GET", route);
  if (!response.success) { console.error(`AIMix ${command} failed: ${response.error}`); return 1; }
  console.log(JSON.stringify(response.data, null, 2)); return 0;
}

module.exports = { run, commands: new Set(Object.keys(GET_ROUTES)) };


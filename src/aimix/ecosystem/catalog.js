import { createEcosystemEntry, validateEcosystemEntry } from "./schema.js";

const manifest = createEcosystemEntry;

const provider = (id, category, status = "discovered", extra = {}) => manifest(id, "provider", category, status, extra.source || null, extra);
const tool = (id, category, status, source, license, extra = {}) => manifest(id, "tool", category, status, source, { license, ...extra });

export const ECOSYSTEM_CATALOG = Object.freeze([
  ...["openai","anthropic","gemini","vertex","azure","mistral","cohere","xai","deepseek","glm","kimi","minimax","baidu","nvidia"].map((id) => provider(id, "llm", "supported")),
  ...["ai21","aws-bedrock","meta-llama-api","iflytek-spark","yi","watsonx","azure-ai-foundry"].map((id) => provider(id, "llm", "planned")),
  ...["openrouter","together","fireworks","groq","cerebras","deepinfra","novita","hyperbolic","baseten","cloudflare-ai","fal-ai","siliconflow","nebius","modal","huggingface","scaleway","aimlapi"].map((id) => provider(id, "inference", "supported")),
  ...["replicate","lepton","runpod","nscale","ovhcloud-ai","public-ai","predibase"].map((id) => provider(id, "inference", "planned")),
  ...["ollama","lm-studio","vllm","llama-cpp","tgi","localai","sglang","tensorrt-llm","xinference","aphrodite","tabbyapi"].map((id) => provider(id, "local-inference", "supported")),
  ...["koboldcpp","mlx-lm","ktransformers","exllamav2"].map((id) => provider(id, "local-inference", "planned")),
  ...["stability-ai","black-forest-labs","recraft","fal-ai-image"].map((id) => provider(id, "image", "supported")),
  ...["ideogram","replicate-image","midjourney"].map((id) => provider(id, "image", id === "midjourney" ? "discovered" : "planned")),
  ...["runway","minimax-video"].map((id) => provider(id, "video", "supported")),
  ...["luma","kling","pika","veo","sora"].map((id) => provider(id, "video", "planned")),
  ...["elevenlabs","deepgram","assemblyai","cartesia","aws-polly","google-tts"].map((id) => provider(id, "speech", "supported")),
  ...["speechmatics","rev-ai","gladia","azure-speech","aws-transcribe","faster-whisper"].map((id) => provider(id, "speech", "planned")),
  ...["voyage-ai","jina-ai","cohere-embed","mistral-embed","openai-embedding","selfhosted-embedding"].map((id) => provider(id, "embedding-rerank", "supported")),
  ...["nomic","flagembedding","sentence-transformers","qdrant-fastembed"].map((id) => provider(id, "embedding-rerank", "planned")),
  ...["tavily","exa","brave-search","google-pse","firecrawl","serper"].map((id) => provider(id, "search-research", "supported")),
  ...["serpapi","bing-search","you-search"].map((id) => provider(id, "search-research", "planned")),

  tool("rtk", "context-processor", "verified", "https://github.com/rtk-ai/rtk", "Apache-2.0", { integration: "external-cli" }),
  tool("headroom", "context-processor", "verified", "https://github.com/headroomlabs-ai/headroom", "Apache-2.0", { integration: "mcp-or-proxy" }),
  tool("tokensave", "code-intelligence", "verified", "https://github.com/aovestdipaperino/tokensave", "MIT", { integration: "mcp" }),
  tool("caveman-style", "smart-profile", "supported", "https://github.com/JuliusBrussee/caveman", "MIT skill; BSL-1.1 runtime", { integration: "native-original-instruction", capabilities: ["terse-output"] }),
  tool("litellm", "gateway", "verified", "https://github.com/BerriAI/litellm", "MIT", { integration: "interop" }),
  ...["portkey","helicone","kong-ai-gateway","envoy-ai-gateway","bifrost"].map((id) => manifest(id, "tool", "gateway", "discovered", null)),
  ...["langfuse","phoenix","openllmetry","openlit","mlflow-tracing","trulens","weave","opentelemetry"].map((id) => manifest(id, "exporter", "observability", "planned", null)),
  ...["promptfoo","deepeval","ragas","openai-evals","mlflow-evaluation"].map((id) => manifest(id, "tool", "evaluation", "planned", null)),
  ...["playwright","puppeteer","selenium","browser-use"].map((id) => manifest(id, "tool", "browser", "planned", null)),
  ...["postgresql","mysql","mariadb","sqlite","mongodb","redis","clickhouse","elasticsearch","opensearch","neo4j","supabase","firebase","snowflake","bigquery","duckdb"].map((id) => manifest(id, "connector", "database", "planned", null)),
  ...["pinecone","qdrant","weaviate","milvus","chroma","pgvector","lancedb","redis-vector"].map((id) => manifest(id, "connector", "vector-store", "planned", null)),
  ...["s3","cloudflare-r2","gcs","azure-blob","minio","local-filesystem","sftp","webdav"].map((id) => manifest(id, "connector", "storage", "planned", null)),
  ...["git","github","gitlab","bitbucket","docker","kubernetes","terraform","npm","pnpm","yarn","pip","uv","cargo","maven","gradle"].map((id) => manifest(id, "tool", "developer", "planned", null)),
  ...["local-sandbox","docker-sandbox","kubernetes-job","firecracker","e2b","modal-compute"].map((id) => manifest(id, "platform", "execution", "planned", null)),
  ...["langchain","llamaindex","haystack","dspy","semantic-kernel","autogen","crewai","pydanticai","smolagents","openai-agents"].map((id) => manifest(id, "framework", "agent-rag", "planned", null)),
  ...["openai-compatible","anthropic-compatible","custom-rest","custom-sse","custom-websocket","custom-grpc","mcp","a2a","openapi"].map((id) => manifest(id, "protocol", "transport", ["openai-compatible","anthropic-compatible"].includes(id) ? "supported" : "planned", null)),
]);

export class UniversalEcosystemRegistry {
  constructor(entries = ECOSYSTEM_CATALOG) {
    this.entries = new Map();
    for (const entry of entries) this.register(entry);
  }
  register(entry) {
    const error = validateEcosystemEntry(entry);
    if (error) throw new Error(`Invalid ecosystem manifest: ${error}`);
    if (this.entries.has(entry.id)) throw new Error(`Duplicate ecosystem id: ${entry.id}`);
    this.entries.set(entry.id, Object.freeze({ ...entry }));
    return entry;
  }
  get(id) { return this.entries.get(id) || null; }
  list(filters = {}) {
    return [...this.entries.values()].filter((entry) => Object.entries(filters).every(([key, value]) => !value || entry[key] === value));
  }
  summary() {
    const result = { total: this.entries.size, byKind: {}, byStatus: {}, byCategory: {} };
    for (const entry of this.entries.values()) {
      result.byKind[entry.kind] = (result.byKind[entry.kind] || 0) + 1;
      result.byStatus[entry.status] = (result.byStatus[entry.status] || 0) + 1;
      result.byCategory[entry.category] = (result.byCategory[entry.category] || 0) + 1;
    }
    return result;
  }
}

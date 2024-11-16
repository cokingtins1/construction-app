import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { OllamaEmbeddings } from "@langchain/ollama";

export const ollamaEmbeddings = new OllamaEmbeddings({
	model: "llama3.1",
	baseUrl: "http://localhost:11434", // Port Ollama is running on
});

// export const ollamaEmbeddings = new HuggingFaceInferenceEmbeddings({
// 	apiKey: process.env.HUGGINGFACEHUB_API_KEY,
// });

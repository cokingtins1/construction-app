import { PrismaClient } from "@prisma/client";

import { LibSQLVectorStore } from "@langchain/community/vectorstores/libsql";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createClient } from "@libsql/client";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

// const embeddings = new OpenAIEmbeddings({
// 	model: "text-embedding-3-small",
// });

export const embeddings = new HuggingFaceInferenceEmbeddings({
	apiKey: process.env.HUGGINGFACEHUB_API_KEY,
});

// const libsqlClient = createClient({
//   url: "libsql://[database-name]-[your-username].turso.io",
//   authToken: "...",
// });

const libsqlClient = createClient({
	url: "file:./dev.db",
});

async function ensureTableExists() {
	const createTableQuery = `
        CREATE TABLE IF NOT EXISTS "VectorStore" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "chunkId" TEXT,
            "content" TEXT,
            "metadata" TEXT,
            "embeddings" BLOB
        );
    `;

	await libsqlClient.execute(createTableQuery);
}

export async function initializeDatabase() {
	await ensureTableExists();
}

export const db = new LibSQLVectorStore(embeddings, {
	db: libsqlClient,
	table: "VectorStore",
	column: "embeddings",
});

export const prisma = new PrismaClient();

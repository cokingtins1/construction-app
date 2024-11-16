-- CreateTable
CREATE TABLE "VectorStore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chunkId" TEXT,
    "content" TEXT,
    "metadata" TEXT,
    "embeddings" BLOB
);

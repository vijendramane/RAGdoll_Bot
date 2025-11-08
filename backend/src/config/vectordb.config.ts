// Placeholder vector DB config to be extended in Phase 2/3
export interface VectorDb {
	upsert: (vectors: Array<{ id: string; values: number[]; metadata?: Record<string, unknown> }>) => Promise<void>;
	query: (vector: number[], topK: number) => Promise<Array<{ id: string; score: number; metadata?: Record<string, unknown> }>>;
}

let memoryStore: Array<{ id: string; values: number[]; metadata?: Record<string, unknown> }> = [];

function cosineSimilarity(a: number[], b: number[]) {
	let dot = 0, na = 0, nb = 0;
	for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
	return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}

class MemoryVectorDb implements VectorDb {
	async upsert(vectors: Array<{ id: string; values: number[]; metadata?: Record<string, unknown> }>) {
		for (const v of vectors) {
			const idx = memoryStore.findIndex((m) => m.id === v.id);
			if (idx >= 0) memoryStore[idx] = v; else memoryStore.push(v);
		}
	}
	async query(vector: number[], topK: number) {
		const scored = memoryStore.map((m) => ({ id: m.id, score: cosineSimilarity(vector, m.values), metadata: m.metadata }));
		return scored.sort((a, b) => b.score - a.score).slice(0, topK);
	}
}

class PineconeVectorDb implements VectorDb {
	private index: any;
	constructor() {
		const { PINECONE_API_KEY, PINECONE_ENVIRONMENT, PINECONE_INDEX } = process.env;
		if (!PINECONE_API_KEY || !PINECONE_INDEX) throw new Error('Pinecone not configured');
		// Lazy import to avoid cost if unused
		// @ts-ignore
		const { Pinecone } = require('@pinecone-database/pinecone');
		const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
		this.index = pc.index(PINECONE_INDEX);
	}
	async upsert(vectors: Array<{ id: string; values: number[]; metadata?: Record<string, unknown> }>) {
		await this.index.upsert(vectors.map((v) => ({ id: v.id, values: v.values, metadata: v.metadata })));
	}
	async query(vector: number[], topK: number) {
		const res = await this.index.query({ vector, topK, includeMetadata: true });
		return (res.matches || []).map((m: any) => ({ id: m.id, score: m.score, metadata: m.metadata }));
	}
}

let impl: VectorDb;
try {
	impl = new PineconeVectorDb();
} catch {
	impl = new MemoryVectorDb();
}

export const vectorDb: VectorDb = impl;


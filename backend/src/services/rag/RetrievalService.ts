import { vectorDb } from '../../config/vectordb.config';

export interface RetrievedChunk {
	id: string;
	score: number;
	metadata?: Record<string, unknown>;
}

export async function semanticSearch(vector: number[], topK = 3): Promise<RetrievedChunk[]> {
	const matches = await vectorDb.query(vector, topK);
	return matches.map((m) => ({ id: m.id, score: m.score, metadata: m.metadata }));
}


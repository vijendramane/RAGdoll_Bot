import { chunkText } from './ChunkingService';
import { embedTexts } from './EmbeddingService';
import { vectorDb } from '../../config/vectordb.config';

export async function ingestText(sourceId: string, text: string) {
	const chunks = chunkText(text, 500, 50);
	const vectors = await embedTexts(chunks);
	await vectorDb.upsert(
		vectors.map((values, i) => ({ id: `${sourceId}-${i}`, values, metadata: { source: sourceId, text: chunks[i] } }))
	);
	return chunks.length;
}


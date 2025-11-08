import { openai, EMBEDDING_MODEL } from '../../config/openai.config';

export async function embedTexts(texts: string[]): Promise<number[][]> {
	const batchSize = 50;
	const out: number[][] = [];
	for (let i = 0; i < texts.length; i += batchSize) {
		const slice = texts.slice(i, i + batchSize);
		const res = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: slice });
		for (const d of res.data) out.push(d.embedding as unknown as number[]);
	}
	return out;
}


import { readFileAsText } from './FAQParserService';
import { ingestText } from '../rag/IngestionService';

export async function processFAQFile(tempPath: string, originalName: string) {
	const text = await readFileAsText(tempPath, originalName);
	const sourceId = `faq-${Date.now()}`;
	const chunks = await ingestText(sourceId, text);
	return { sourceId, chunks };
}


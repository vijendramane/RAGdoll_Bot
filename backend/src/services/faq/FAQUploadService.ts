import { readFileAsText } from './FAQParserService';
import { ingestText } from '../rag/IngestionService';
import { FAQSourceService } from './FAQSourceService';

export async function processFAQFile(tempPath: string, originalName: string) {
	const text = await readFileAsText(tempPath, originalName);
	const sourceId = `faq-${Date.now()}`;
	const chunkCount = await ingestText(sourceId, text);

	// Store metadata
	const fileExt = originalName.split('.').pop()?.toLowerCase() || 'unknown';
	await FAQSourceService.addSource({
		sourceId,
		originalName,
		chunkCount,
		fileType: fileExt,
		content: text
	});

	return { sourceId, chunks: chunkCount };
}


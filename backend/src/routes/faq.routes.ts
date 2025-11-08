import { Router } from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';
import path from 'node:path';
import { processFAQFile } from '../services/faq/FAQUploadService';
import { FAQSourceService } from '../services/faq/FAQSourceService';
import { vectorDb } from '../config/vectordb.config';
import { embedTexts } from '../services/rag/EmbeddingService';
import { chunkText } from '../services/rag/ChunkingService';

const router = Router();

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
	try {
		await fs.mkdir('uploads', { recursive: true });
	} catch (error) {
		console.error('Failed to create uploads directory:', error);
	}
};

const upload = multer({
	dest: 'uploads/',
	limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

router.get('/', async (_req, res) => {
	try {
		const sources = await FAQSourceService.getAllSources();
		return res.json({ items: sources });
	} catch (error) {
		console.error('Failed to fetch FAQ sources:', error);
		return res.status(500).json({ error: 'Failed to fetch FAQ sources' });
	}
});

// Get FAQ source by ID for editing
router.get('/sources/:sourceId', async (req, res) => {
	try {
		const { sourceId } = req.params;
		const source = await FAQSourceService.getSource(sourceId);

		if (!source) {
			return res.status(404).json({ error: 'FAQ source not found' });
		}

		return res.json(source);
	} catch (error) {
		console.error('Failed to fetch FAQ source:', error);
		return res.status(500).json({ error: 'Failed to fetch FAQ source' });
	}
});

// Update FAQ source content
router.put('/sources/:sourceId', async (req, res) => {
	try {
		const { sourceId } = req.params;
		const { content, mode } = req.body; // mode: 'text' or 'qa'

		if (!content || typeof content !== 'string') {
			return res.status(400).json({ error: 'Content is required and must be a string' });
		}

		// Check if source exists
		const existingSource = await FAQSourceService.getSource(sourceId);
		if (!existingSource) {
			return res.status(404).json({ error: 'FAQ source not found' });
		}

		// Delete existing vectors for this source
		await vectorDb.deleteBySource(sourceId);

		// Process updated content
		const chunks = chunkText(content, 500, 50);
		const vectors = await embedTexts(chunks);

		await vectorDb.upsert(
			vectors.map((values, i) => ({
				id: `${sourceId}-${i}`,
				values,
				metadata: { source: sourceId, text: chunks[i] }
			}))
		);

		// Update metadata
		await FAQSourceService.updateSource(sourceId, {
			content,
			chunkCount: chunks.length
		});

		return res.json({
			ok: true,
			message: 'FAQ content updated successfully',
			chunkCount: chunks.length
		});
	} catch (error) {
		console.error('Failed to update FAQ source:', error);
		return res.status(500).json({ error: 'Failed to update FAQ content: ' + (error as Error).message });
	}
});

// Delete FAQ source
router.delete('/sources/:sourceId', async (req, res) => {
	try {
		const { sourceId } = req.params;

		// Check if source exists
		const existingSource = await FAQSourceService.getSource(sourceId);
		if (!existingSource) {
			return res.status(404).json({ error: 'FAQ source not found' });
		}

		// Delete vectors and metadata
		await vectorDb.deleteBySource(sourceId);
		await FAQSourceService.deleteSource(sourceId);

		return res.json({
			ok: true,
			message: 'FAQ source deleted successfully'
		});
	} catch (error) {
		console.error('Failed to delete FAQ source:', error);
		return res.status(500).json({ error: 'Failed to delete FAQ source: ' + (error as Error).message });
	}
});

router.post('/upload', (req, res, next) => {
	upload.single('file')(req, res, (err: any) => {
		if (err) {
			if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File too large. Max 10MB.' });
			if (err.code === 'LIMIT_UNEXPECTED_FILE') return res.status(400).json({ error: 'Only one file allowed.' });
			return res.status(400).json({ error: 'Upload error: ' + (err.message || 'unknown') });
		}
		next();
	});
}, async (req, res) => {
	try {
		// Ensure uploads directory exists
		await ensureUploadsDir();

		if (!req.file) return res.status(400).json({ error: 'File is required' });

		// Process the file
		const result = await processFAQFile(req.file.path, req.file.originalname);

		// Clean up uploaded file after processing
		try {
			await fs.unlink(req.file.path);
		} catch (cleanupError) {
			console.warn('Failed to cleanup uploaded file:', cleanupError);
		}

		return res.json({ ok: true, ...result });
	} catch (e) {
		const msg = (e as Error).message || 'Failed to process file';
		console.error('FAQ upload error:', e);
		return res.status(500).json({ error: msg });
	}
});

export default router;


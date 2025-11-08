import { Router } from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';
import path from 'node:path';
import { processFAQFile } from '../services/faq/FAQUploadService';

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
	return res.json({ items: [] });
});

router.post('/upload', (req, res, next) => {
	upload.single('file')(req, res, (err: any) => {
		if (err) {
			if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File too large. Max 10MB.' });
			return res.status(400).json({ error: 'Upload error: ' + (err.message || 'unknown') });
		}
		next();
	});
}, async (req, res) => {
	try {
		if (!req.file) return res.status(400).json({ error: 'File is required' });
		const result = await processFAQFile(req.file.path, req.file.originalname);
		return res.json({ ok: true, ...result });
	} catch (e) {
		const msg = (e as Error).message || 'Failed to process file';
		return res.status(500).json({ error: msg });
	}
});

export default router;


import { Router } from 'express';
import { z } from 'zod';
import { testConnection, saveDbConfig } from '../config/database.config';

const router = Router();

const DbConfigSchema = z.object({
	type: z.enum(['mysql', 'postgres', 'mongodb']),
	host: z.string().min(1),
	port: z.union([z.number(), z.string()]).transform((v) => Number(v)),
	user: z.string().min(1),
	password: z.string().optional().transform((v) => v ?? ''),
	database: z.string().min(1)
});

router.post('/test-connection', async (req, res) => {
	try {
		const parsed = DbConfigSchema.safeParse(req.body);
		if (!parsed.success) return res.status(400).json({ error: 'Invalid config', details: parsed.error.flatten() });
		await testConnection(parsed.data);
		return res.json({ ok: true });
	} catch (err) {
		const msg = (err as Error).message || 'Unexpected error';
		return res.status(500).json({ error: msg });
	}
});

router.post('/save', async (_req, res) => {
	try {
		const parsed = DbConfigSchema.safeParse(_req.body);
		if (!parsed.success) return res.status(400).json({ error: 'Invalid config', details: parsed.error.flatten() });
		await saveDbConfig(parsed.data);
		return res.json({ ok: true });
	} catch (e) {
		return res.status(500).json({ error: 'Failed to save configuration' });
	}
});

export default router;


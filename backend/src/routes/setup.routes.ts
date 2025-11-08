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
		if (!parsed.success) {
			return res.status(400).json({
				error: 'Invalid configuration',
				details: parsed.error.flatten()
			});
		}

		console.log('Testing database connection with config:', {
			type: parsed.data.type,
			host: parsed.data.host,
			port: parsed.data.port,
			database: parsed.data.database
		});

		await testConnection(parsed.data);
		return res.json({ ok: true, message: 'Connection successful' });
	} catch (err) {
		const error = err as Error;
		console.error('Database connection test failed:', error);

		// Provide more specific error messages
		let errorMessage = error.message;
		if (errorMessage.includes('ECONNREFUSED')) {
			errorMessage = 'Connection refused. Check if database server is running and accessible.';
		} else if (errorMessage.includes('ENOTFOUND')) {
			errorMessage = 'Host not found. Check the database hostname.';
		} else if (errorMessage.includes('ER_ACCESS_DENIED')) {
			errorMessage = 'Access denied. Check username and password.';
		} else if (errorMessage.includes('ER_BAD_DB_ERROR')) {
			errorMessage = 'Database not found. Check database name.';
		}

		return res.status(500).json({ error: errorMessage });
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


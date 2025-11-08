import { Router } from 'express';
import { testOpenAIConnection } from '../config/openai.config';
import { vectorDb } from '../config/vectordb.config';
import fs from 'node:fs/promises';
import path from 'node:path';

const router = Router();

router.get('/status', async (_req, res) => {
	const status: any = {
		timestamp: new Date().toISOString(),
		services: {}
	};

	// Check OpenAI
	try {
		const openaiStatus = await testOpenAIConnection();
		status.services.openai = {
			status: openaiStatus ? 'connected' : 'failed',
			apiKey: process.env.OPENAI_API_KEY ? 'configured' : 'missing'
		};
	} catch (error) {
		status.services.openai = {
			status: 'error',
			error: (error as Error).message
		};
	}

	// Check Pinecone/Vector DB
	try {
		// Test vector DB by trying to query
		await vectorDb.query(new Array(1536).fill(0), 1);
		status.services.vectorDb = {
			status: 'connected',
			type: process.env.PINECONE_API_KEY ? 'pinecone' : 'in-memory'
		};
	} catch (error) {
		status.services.vectorDb = {
			status: 'error',
			error: (error as Error).message
		};
	}

	// Check directories
	const directories = ['uploads', 'data'];
	for (const dir of directories) {
		try {
			await fs.access(dir);
			status[dir] = 'exists';
		} catch {
			status[dir] = 'missing';
		}
	}

	// Check environment variables
	status.environment = {
		NODE_ENV: process.env.NODE_ENV,
		PORT: process.env.PORT,
		OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'set' : 'missing',
		PINECONE_API_KEY: process.env.PINECONE_API_KEY ? 'set' : 'missing',
		REDIS_URL: process.env.REDIS_URL ? 'set' : 'missing'
	};

	res.json(status);
});

export default router;
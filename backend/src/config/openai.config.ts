import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
	console.warn('OPENAI_API_KEY not set');
}

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';


import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
	console.error('❌ OPENAI_API_KEY not set in environment variables');
	console.error('Please set OPENAI_API_KEY in your backend/.env file');
	process.exit(1);
}

console.log('✅ OpenAI API key configured');

export const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	// Add timeout and retry configuration
	timeout: 30000,
	maxRetries: 3
});

export const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
export const CHAT_MODEL = process.env.CHAT_MODEL || 'gpt-4o-mini';

// Test OpenAI connection on startup
export async function testOpenAIConnection() {
	try {
		const response = await openai.chat.completions.create({
			model: CHAT_MODEL,
			messages: [{ role: 'user', content: 'Hello' }],
			max_tokens: 5
		});
		console.log('✅ OpenAI connection test successful');
		return true;
	} catch (error) {
		console.error('❌ OpenAI connection test failed:', error);
		return false;
	}
}


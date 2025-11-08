import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
	console.error('❌ OPENAI_API_KEY not set in environment variables');
	console.error('Please set OPENAI_API_KEY in your backend/.env file');
	console.error('⚠️ Chat functionality will be limited to basic responses');
}

console.log('🔑 OpenAI API key configured');

export const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
	// Add timeout and retry configuration
	timeout: 30000,
	maxRetries: 3
});

// Test OpenAI connection on startup
export async function testOpenAIConnection() {
	if (!process.env.OPENAI_API_KEY) {
		console.error('❌ No OpenAI API key configured');
		return false;
	}

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
		console.error('💡 This may be due to:');
		console.error('   - Invalid API key');
		console.error('   - Expired API key');
		console.error('   - Insufficient credits');
		console.error('   - Network issues');
		return false;
	}
}

export const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
export const CHAT_MODEL = process.env.CHAT_MODEL || 'gpt-4o-mini';


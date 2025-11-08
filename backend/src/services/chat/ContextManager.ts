import { redis } from '../../config/redis.config';

const HISTORY_LIMIT = 10;

export async function appendHistory(sessionId: string, role: 'user' | 'assistant', content: string) {
	const key = `chat:${sessionId}:history`;
	await redis.rpush(key, JSON.stringify({ role, content, ts: Date.now() }));
	await redis.ltrim(key, -HISTORY_LIMIT, -1);
}

export async function getHistory(sessionId: string) {
	const key = `chat:${sessionId}:history`;
	const items = await redis.lrange(key, 0, -1);
	return items.map((i) => JSON.parse(i) as { role: string; content: string; ts: number });
}


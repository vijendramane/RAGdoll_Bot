import Redis from 'ioredis';

export const REDIS_TTL_SECONDS = Number(process.env.REDIS_TTL_SECONDS || 900);

type RedisLike = {
	rpush: (key: string, value: string) => Promise<number> | number;
	ltrim: (key: string, start: number, stop: number) => Promise<'OK'> | 'OK';
	lrange: (key: string, start: number, stop: number) => Promise<string[]> | string[];
};

const url = process.env.REDIS_URL;

function createMemoryRedis(): RedisLike {
	const store = new Map<string, string[]>();
	return {
		rpush(key: string, value: string) {
			const arr = store.get(key) || [];
			arr.push(value);
			store.set(key, arr);
			return arr.length;
		},
		ltrim(key: string, start: number, stop: number) {
			const arr = store.get(key) || [];
			const len = arr.length;
			const s = start < 0 ? Math.max(0, len + start) : start;
			const e = stop < 0 ? len + stop + 1 : stop + 1;
			store.set(key, arr.slice(s, e));
			return 'OK';
		},
		lrange(key: string, start: number, stop: number) {
			const arr = store.get(key) || [];
			const len = arr.length;
			const s = start < 0 ? Math.max(0, len + start) : start;
			const e = stop < 0 ? len + stop + 1 : stop + 1;
			return arr.slice(s, e);
		}
	};
}

function createSafeRedis(realUrl: string | null): RedisLike {
	if (!realUrl) return createMemoryRedis();
	const client = new Redis(realUrl, {
		retryStrategy: (times) => Math.min(times * 200, 2000),
		maxRetriesPerRequest: 1,
		enableOfflineQueue: false,
		lazyConnect: true
	});
	client.on('error', () => {/* swallow to avoid noisy logs in dev */});

	const memory = createMemoryRedis();

	return {
		async rpush(key: string, value: string) {
			try {
				await client.connect().catch(() => {});
				// @ts-ignore ioredis returns number
				return await (client as any).rpush(key, value).catch(() => memory.rpush(key, value));
			} catch {
				return memory.rpush(key, value);
			}
		},
		async ltrim(key: string, start: number, stop: number) {
			try {
				await client.connect().catch(() => {});
				// @ts-ignore
				return await (client as any).ltrim(key, start, stop).catch(() => memory.ltrim(key, start, stop));
			} catch {
				return memory.ltrim(key, start, stop);
			}
		},
		async lrange(key: string, start: number, stop: number) {
			try {
				await client.connect().catch(() => {});
				// @ts-ignore
				return await (client as any).lrange(key, start, stop).catch(() => memory.lrange(key, start, stop));
			} catch {
				return memory.lrange(key, start, stop);
			}
		}
	};
}

export const redis: RedisLike = (url && url !== 'mock') ? createSafeRedis(url) : createSafeRedis(null);


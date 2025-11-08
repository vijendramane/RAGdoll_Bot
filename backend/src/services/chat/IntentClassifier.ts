export type Intents = {
	product_info: number;
	order_tracking: number;
	returns: number;
	shipping: number;
};

const keywords: Record<keyof Intents, string[]> = {
	product_info: ['price', 'availability', 'product', 'sku', 'stock', 'details'],
	order_tracking: ['track', 'order', 'status', 'where is', 'delivery date'],
	returns: ['return', 'refund', 'exchange', 'cancel'],
	shipping: ['shipping', 'delivery', 'fee', 'time', 'carrier']
};

export function classifyIntent(query: string): Intents {
	const q = query.toLowerCase();
	const scores: Intents = { product_info: 0, order_tracking: 0, returns: 0, shipping: 0 };
	for (const k of Object.keys(keywords) as (keyof Intents)[]) {
		for (const w of keywords[k]) {
			if (q.includes(w)) scores[k] += 0.2;
		}
	}
	// normalize
	const max = Math.max(...Object.values(scores));
	if (max === 0) return { product_info: 0.25, order_tracking: 0.25, returns: 0.25, shipping: 0.25 };
	const out: Intents = { product_info: 0, order_tracking: 0, returns: 0, shipping: 0 };
	for (const k of Object.keys(scores) as (keyof Intents)[]) out[k] = Number((scores[k] / max).toFixed(2));
	return out;
}


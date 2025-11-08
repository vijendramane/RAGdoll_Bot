import { classifyIntent } from '../chat/IntentClassifier';

export function generateClarificationOptions(query: string) {
	const intents = classifyIntent(query);
	const options = [
		{ id: 1, text: 'Product information and availability', icon: '🛍️', confidence: intents.product_info },
		{ id: 2, text: 'Order tracking and status', icon: '📦', confidence: intents.order_tracking },
		{ id: 3, text: 'Returns and refunds', icon: '↩️', confidence: intents.returns },
		{ id: 4, text: 'Shipping and delivery', icon: '🚚', confidence: intents.shipping }
	].sort((a, b) => b.confidence - a.confidence).slice(0, 3);

	options.push({ id: 0, text: 'None of these - let me rephrase', icon: '✍️', confidence: 0 });
	return options;
}


import { embedTexts } from '../rag/EmbeddingService';
import { semanticSearch } from '../rag/RetrievalService';
import { generateClarificationOptions } from '../query/ClarificationService';
import { appendHistory } from './ContextManager';
import { openai } from '../../config/openai.config';
import { classifyIntent } from './IntentClassifier';
import { getConfiguredAdapter } from '../../config/database.config';
import { redis } from '../../config/redis.config';

export interface ChatResult {
	answer: string;
	sources: string[];
	clarification?: Array<{ id: number; text: string; icon: string; confidence?: number }>;
}

export async function handleQuery(sessionId: string, userMessage: string): Promise<ChatResult> {
    await appendHistory(sessionId, 'user', userMessage);
    try {
        // Cache lookup
        const cached = await (redis as any).get?.(`ans:${userMessage}`);
        if (cached) {
            const parsed = JSON.parse(cached);
            await appendHistory(sessionId, 'assistant', parsed.answer);
            return parsed;
        }
        let matches: Array<{ score: number; metadata?: Record<string, unknown> }> = [];
        try {
            const [queryEmbedding] = await embedTexts([userMessage]);
            matches = await semanticSearch(queryEmbedding, 3);
        } catch (e) {
            // Embedding/vector lookup failed (likely no OPENAI_API_KEY). Continue with zero matches.
            matches = [];
        }

        const avgScore = matches.length ? matches.reduce((s, m) => s + (m.score || 0), 0) / matches.length : 0;

        // If we have good matches, answer constrained to context with citations
        if (avgScore >= 0.8) {
            const context = matches.map((m) => String(m.metadata?.text || '')).join('\n\n');
            const messages = [
                { role: 'system', content: `Answer based ONLY on this context. Always cite sources.\n${context}` },
                { role: 'user', content: userMessage }
            ] as const;

            const completion = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: messages as any, temperature: 0.3 });
            const answer = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
            await appendHistory(sessionId, 'assistant', answer);
            return { answer, sources: matches.map((m) => String(m.metadata?.source || 'faq')) };
        }

        // Low confidence or no vector context:
        // First: try OpenAI function calling for realtime data
        const adapter = await getConfiguredAdapter();
        const tools = [
            {
                type: 'function',
                function: {
                    name: 'checkInventory',
                    description: 'Check stock availability by SKU',
                    parameters: { type: 'object', properties: { sku: { type: 'string' } }, required: ['sku'] }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'getOrderStatus',
                    description: 'Get order status by orderId',
                    parameters: { type: 'object', properties: { orderId: { type: 'string' } }, required: ['orderId'] }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'getProductDetails',
                    description: 'Search products by name or SKU',
                    parameters: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] }
                }
            }
        ] as any;

        try {
            const fc = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'You can call functions to fetch real-time data.' },
                    { role: 'user', content: userMessage }
                ],
                tools,
                tool_choice: 'auto',
                temperature: 0
            } as any);
            const choice: any = fc.choices?.[0];
            const toolCall = choice?.message?.tool_calls?.[0];
            if (toolCall && adapter) {
                const { name, arguments: argsStr } = toolCall.function;
                const args = JSON.parse(argsStr || '{}');
                let answer = '';
                if (name === 'checkInventory') {
                    const res = await adapter.checkInventory(args.sku);
                    answer = res.available ? `SKU ${res.sku} is in stock: ${res.quantity} units.` : `SKU ${res.sku} is out of stock.`;
                } else if (name === 'getOrderStatus') {
                    const res = await adapter.getOrderStatus(args.orderId);
                    answer = `Order ${res.id} status: ${res.status}.`;
                } else if (name === 'getProductDetails') {
                    const list = await adapter.getProducts({ name: args.query, sku: args.query });
                    if (!list.length) answer = 'No matching products found.';
                    else answer = `Found ${list.length} product(s). Top: ${list[0].name} (SKU ${list[0].sku}) at $${list[0].price}.`;
                }
                if (answer) {
                    const result = { answer, sources: [], clarification: generateClarificationOptions(userMessage) };
                    await appendHistory(sessionId, 'assistant', answer);
                    await (redis as any).set?.(`ans:${userMessage}`, JSON.stringify(result), 'EX', 300);
                    return result;
                }
            }
        } catch {}

        // Next: try a general model answer without RAG
        try {
            const general = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'You are a helpful e-commerce assistant. Answer concisely and clearly.' },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.3
            });
            const answer = general.choices[0]?.message?.content || 'I could not generate a response.';
            await appendHistory(sessionId, 'assistant', answer);
            const result = { answer, sources: [] , clarification: generateClarificationOptions(userMessage)};
            await (redis as any).set?.(`ans:${userMessage}`, JSON.stringify(result), 'EX', 300);
            return result;
        } catch {
            // 2) If OpenAI not configured, return a heuristic fallback
            const intents = classifyIntent(userMessage);
            const top = Object.entries(intents).sort((a,b) => b[1]-a[1])[0]?.[0] || 'product_info';
            const canned: Record<string, string> = {
                product_info: 'I can help with product details and availability. Please provide a product name or SKU.',
                order_tracking: 'I can help track your order. Please share your order ID.',
                returns: 'I can help with returns or refunds. Do you have your order ID handy?',
                shipping: 'I can help with shipping options and delivery times. Which location are you shipping to?'
            };
            const answer = canned[top];
            await appendHistory(sessionId, 'assistant', answer);
            const result = { answer, sources: [], clarification: generateClarificationOptions(userMessage) };
            await (redis as any).set?.(`ans:${userMessage}`, JSON.stringify(result), 'EX', 300);
            return result;
        }
    } catch (error) {
        const message = (error as Error)?.message || 'Unexpected error';
        await appendHistory(sessionId, 'assistant', message);
        throw new Error(message);
    }
}


import { embedTexts } from '../rag/EmbeddingService';
import { semanticSearch } from '../rag/RetrievalService';
import { generateClarificationOptions } from '../query/ClarificationService';
import { appendHistory } from './ContextManager';
import { openai } from '../../config/openai.config';
import { classifyIntent } from './IntentClassifier';
import { getConfiguredAdapter } from '../../config/database.config';
import { redis } from '../../config/redis.config';
import { AnalyticsService } from '../analytics/AnalyticsService';

export interface ChatResult {
	answer: string;
	sources: string[];
	clarification?: Array<{ id: number; text: string; icon: string; confidence?: number }>;
}

// Order ID clarification logic
function detectOrderIntent(message: string): boolean {
    const orderKeywords = [
        'order', 'payment', 'refund', 'shipment', 'delivery', 'track', 'status',
        'purchase', 'bought', 'transaction', 'billing', 'invoice', 'receipt'
    ];
    const lowerMessage = message.toLowerCase();
    return orderKeywords.some(keyword => lowerMessage.includes(keyword));
}

function extractOrderId(message: string): string | null {
    // Common order ID patterns: alphanumeric combinations
    const patterns = [
        /\b[A-Z]{2,}-?\d{4,}\b/g,  // AB-1234 format
        /\b\d{6,}\b/g,             // 123456 format
        /\b[A-Z]{1,}\d{5,}\b/g,    // A12345 format
    ];

    for (const pattern of patterns) {
        const matches = message.match(pattern);
        if (matches && matches.length > 0) {
            return matches[0];
        }
    }
    return null;
}

function generateOrderClarificationResponse(intent: string): string {
    const responses = [
        "I can help you with that! To check your order status, I'll need your order ID. Could you please provide it?",
        "I'd be happy to help track your order. What's your order ID?",
        "To assist you with your order, I'll need the order ID. Can you share it with me?",
        "I can help with order inquiries. Please provide your order ID so I can look that up for you."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

// Helper function to record analytics
async function recordChatAnalytics(
    sessionId: string,
    userMessage: string,
    answer: string,
    sources: string[],
    responseTime: number,
    success: boolean
): Promise<void> {
    try {
        // Record analytics asynchronously without blocking the response
        AnalyticsService.recordChat({
            sessionId,
            timestamp: new Date().toISOString(),
            userMessage,
            botResponse: answer,
            sources,
            responseTime,
            success
        }).catch(error => {
            console.error('Failed to record analytics:', error);
        });
    } catch (error) {
        // Don't let analytics errors affect the main chat flow
        console.error('Analytics recording error:', error);
    }
}

export async function handleQuery(sessionId: string, userMessage: string): Promise<ChatResult> {
    const startTime = Date.now();
    await appendHistory(sessionId, 'user', userMessage);
    try {
        // Check for order-related queries that need order ID clarification
        const hasOrderIntent = detectOrderIntent(userMessage);
        const orderId = extractOrderId(userMessage);

        if (hasOrderIntent && !orderId) {
            const clarificationResponse = generateOrderClarificationResponse('order');
            await appendHistory(sessionId, 'assistant', clarificationResponse);

            // Record analytics for clarification request
            const responseTime = Date.now() - startTime;
            recordChatAnalytics(sessionId, userMessage, clarificationResponse, [], responseTime, true);

            return { answer: clarificationResponse, sources: [] };
        }

        // Cache lookup
        const cached = await (redis as any).get?.(`ans:${userMessage}`);
        if (cached) {
            const parsed = JSON.parse(cached);
            await appendHistory(sessionId, 'assistant', parsed.answer);

            // Record analytics for cached response
            const responseTime = Date.now() - startTime;
            recordChatAnalytics(sessionId, userMessage, parsed.answer, parsed.sources || [], responseTime, true);

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

            // Record analytics for vector match response
            const responseTime = Date.now() - startTime;
            const sources = matches.map((m) => String(m.metadata?.source || 'faq'));
            recordChatAnalytics(sessionId, userMessage, answer, sources, responseTime, true);

            return { answer, sources };
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

                    // Record analytics for function calling response
                    const responseTime = Date.now() - startTime;
                    recordChatAnalytics(sessionId, userMessage, answer, [], responseTime, true);

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


import fs from 'node:fs/promises';
import path from 'node:path';

export interface ChatSession {
	sessionId: string;
	timestamp: string;
	userMessage: string;
	botResponse: string;
	sources: string[];
	responseTime: number;
	success: boolean;
	topics?: string[];
}

export interface AnalyticsData {
	totalChats: number;
	uniqueUsers: number;
	averageResponseTime: number;
	successRate: number;
	topTopics: Array<{ topic: string; count: number }>;
	recentChats: ChatSession[];
	dailyStats: Array<{ date: string; chats: number; users: number }>;
	errorRate: number;
}

const ANALYTICS_PATH = path.join(process.cwd(), 'data', 'analytics.json');
const CHATS_PATH = path.join(process.cwd(), 'data', 'chats.json');

export class AnalyticsService {
	private static async ensureDataDir(): Promise<void> {
		await fs.mkdir(path.dirname(ANALYTICS_PATH), { recursive: true });
	}

	private static async loadChats(): Promise<ChatSession[]> {
		try {
			await this.ensureDataDir();
			const raw = await fs.readFile(CHATS_PATH, 'utf-8');
			return JSON.parse(raw);
		} catch {
			return [];
		}
	}

	private static async saveChats(chats: ChatSession[]): Promise<void> {
		await this.ensureDataDir();
		await fs.writeFile(CHATS_PATH, JSON.stringify(chats, null, 2), 'utf-8');
	}

	static async recordChat(session: ChatSession): Promise<void> {
		const chats = await this.loadChats();
		chats.push(session);

		// Keep only last 10000 chat records to avoid file getting too large
		if (chats.length > 10000) {
			chats.splice(0, chats.length - 10000);
		}

		await this.saveChats(chats);
	}

	static async getOverview(): Promise<Omit<AnalyticsData, 'recentChats' | 'topTopics' | 'dailyStats'>> {
		const chats = await this.loadChats();

		if (chats.length === 0) {
			return {
				totalChats: 0,
				uniqueUsers: 0,
				averageResponseTime: 0,
				successRate: 0,
				errorRate: 0
			};
		}

		const uniqueUsers = new Set(chats.map(c => c.sessionId)).size;
		const totalResponseTime = chats.reduce((sum, c) => sum + c.responseTime, 0);
		const averageResponseTime = totalResponseTime / chats.length;
		const successfulChats = chats.filter(c => c.success).length;
		const successRate = (successfulChats / chats.length) * 100;
		const errorRate = 100 - successRate;

		return {
			totalChats: chats.length,
			uniqueUsers,
			averageResponseTime: Math.round(averageResponseTime),
			successRate: Math.round(successRate * 100) / 100,
			errorRate: Math.round(errorRate * 100) / 100
		};
	}

	static async getRecentChats(limit: number = 50): Promise<ChatSession[]> {
		const chats = await this.loadChats();
		return chats
			.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
			.slice(0, limit);
	}

	static async getTopicAnalysis(): Promise<Array<{ topic: string; count: number }>> {
		const chats = await this.loadChats();
		const topicCounts: Record<string, number> = {};

		chats.forEach(chat => {
			const topics = this.extractTopics(chat.userMessage);
			topics.forEach(topic => {
				topicCounts[topic] = (topicCounts[topic] || 0) + 1;
			});
		});

		return Object.entries(topicCounts)
			.map(([topic, count]) => ({ topic, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 10);
	}

	static async getDailyStats(days: number = 30): Promise<Array<{ date: string; chats: number; users: number }>> {
		const chats = await this.loadChats();
		const dailyData: Record<string, { chats: number; users: Set<string> }> = {};

		// Initialize last N days
		for (let i = days - 1; i >= 0; i--) {
			const date = new Date();
			date.setDate(date.getDate() - i);
			const dateStr = date.toISOString().split('T')[0];
			dailyData[dateStr] = { chats: 0, users: new Set() };
		}

		// Count chats per day
		chats.forEach(chat => {
			const date = new Date(chat.timestamp).toISOString().split('T')[0];
			if (dailyData[date]) {
				dailyData[date].chats++;
				dailyData[date].users.add(chat.sessionId);
			}
		});

		return Object.entries(dailyData).map(([date, data]) => ({
			date,
			chats: data.chats,
			users: data.users.size
		}));
	}

	private static extractTopics(message: string): string[] {
		const lowerMessage = message.toLowerCase();
		const topics: string[] = [];

		const topicKeywords = {
			'Order Status': ['order', 'status', 'track', 'shipment', 'delivery'],
			'Product Info': ['product', 'item', 'price', 'cost', 'available'],
			'Payment': ['payment', 'pay', 'bill', 'charge', 'credit card'],
			'Refund': ['refund', 'return', 'money back', 'reimburse'],
			'Shipping': ['shipping', 'delivery', 'postage', 'carrier'],
			'Account': ['account', 'profile', 'login', 'password'],
			'General FAQ': ['help', 'question', 'how to', 'what is'],
			'Complaint': ['complaint', 'problem', 'issue', 'wrong', 'broken'],
			'Catalog': ['catalog', 'browse', 'search', 'find'],
			'Technical': ['error', 'bug', 'broken', 'not working']
		};

		Object.entries(topicKeywords).forEach(([topic, keywords]) => {
			if (keywords.some(keyword => lowerMessage.includes(keyword))) {
				topics.push(topic);
			}
		});

		return topics.length > 0 ? topics : ['General'];
	}

	static async getPerformanceMetrics(): Promise<{
		avgResponseTime: number;
		successRate: number;
		errorRate: number;
		totalQueries: number;
		queriesWithSources: number;
		sourceUsageRate: number;
	}> {
		const chats = await this.loadChats();

		if (chats.length === 0) {
			return {
				avgResponseTime: 0,
				successRate: 0,
				errorRate: 0,
				totalQueries: 0,
				queriesWithSources: 0,
				sourceUsageRate: 0
			};
		}

		const totalResponseTime = chats.reduce((sum, c) => sum + c.responseTime, 0);
		const avgResponseTime = totalResponseTime / chats.length;
		const successfulChats = chats.filter(c => c.success).length;
		const successRate = (successfulChats / chats.length) * 100;
		const errorRate = 100 - successRate;
		const queriesWithSources = chats.filter(c => c.sources.length > 0).length;
		const sourceUsageRate = (queriesWithSources / chats.length) * 100;

		return {
			avgResponseTime: Math.round(avgResponseTime),
			successRate: Math.round(successRate * 100) / 100,
			errorRate: Math.round(errorRate * 100) / 100,
			totalQueries: chats.length,
			queriesWithSources,
			sourceUsageRate: Math.round(sourceUsageRate * 100) / 100
		};
	}
}
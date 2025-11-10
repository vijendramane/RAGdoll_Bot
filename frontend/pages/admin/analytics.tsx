import React, { useState, useEffect } from 'react';

interface OverviewData {
	totalChats: number;
	uniqueUsers: number;
	averageResponseTime: number;
	successRate: number;
	errorRate: number;
}

interface TopicData {
	topic: string;
	count: number;
}

interface DailyData {
	date: string;
	chats: number;
	users: number;
}

interface ChatData {
	sessionId: string;
	timestamp: string;
	userMessage: string;
	botResponse: string;
	sources: string[];
	responseTime: number;
	success: boolean;
}

export default function Analytics() {
	const [overview, setOverview] = useState<OverviewData | null>(null);
	const [topics, setTopics] = useState<TopicData[]>([]);
	const [dailyStats, setDailyStats] = useState<DailyData[]>([]);
	const [recentChats, setRecentChats] = useState<ChatData[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Load all analytics data
	useEffect(() => {
		loadAnalyticsData();
		// Set up real-time updates every 30 seconds
		const interval = setInterval(loadAnalyticsData, 30000);
		return () => clearInterval(interval);
	}, []);

	async function loadAnalyticsData() {
		try {
			setLoading(true);
			const [overviewRes, topicsRes, dailyRes, chatsRes] = await Promise.all([
				fetch('/api/proxy/analytics-overview'),
				fetch('/api/proxy/analytics-topics'),
				fetch('/api/proxy/analytics-daily?days=30'),
				fetch('/api/proxy/analytics-chats?limit=10')
			]);

			const [overviewData, topicsData, dailyData, chatsData] = await Promise.all([
				overviewRes.json(),
				topicsRes.json(),
				dailyRes.json(),
				chatsRes.json()
			]);

			if (overviewData.ok) setOverview(overviewData.data);
			if (topicsData.ok) setTopics(topicsData.data);
			if (dailyData.ok) setDailyStats(dailyData.data);
			if (chatsData.ok) setRecentChats(chatsData.data);
		} catch (err) {
			setError('Failed to load analytics data');
		} finally {
			setLoading(false);
		}
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString();
	};

	const formatMessage = (message: string, maxLength: number = 50) => {
		return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
	};

	if (loading && !overview) {
		return (
			<main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading analytics...</p>
				</div>
			</main>
		);
	}

	if (error) {
		return (
			<main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
				<div className="text-center">
					<p className="text-red-600 mb-4">{error}</p>
					<button onClick={loadAnalyticsData} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
						Retry
					</button>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
			<div className="max-w-7xl mx-auto p-6">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
						Analytics Dashboard
					</h1>
					<p className="text-gray-600">
						Real-time insights into your chatbot performance and user interactions
					</p>
				</div>

				{/* Key Metrics Cards */}
				{overview && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
						<div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600 mb-1">Total Chats</p>
									<p className="text-2xl font-bold text-gray-900">{overview.totalChats.toLocaleString()}</p>
								</div>
								<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
									<span className="text-2xl">💬</span>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600 mb-1">Unique Users</p>
									<p className="text-2xl font-bold text-gray-900">{overview.uniqueUsers.toLocaleString()}</p>
								</div>
								<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
									<span className="text-2xl">👥</span>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600 mb-1">Success Rate</p>
									<p className="text-2xl font-bold text-green-600">{overview.successRate}%</p>
								</div>
								<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
									<span className="text-2xl">✅</span>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600 mb-1">Avg Response Time</p>
									<p className="text-2xl font-bold text-blue-600">{overview.averageResponseTime}ms</p>
								</div>
								<div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
									<span className="text-2xl">⚡</span>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600 mb-1">Error Rate</p>
									<p className="text-2xl font-bold text-red-600">{overview.errorRate}%</p>
								</div>
								<div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
									<span className="text-2xl">⚠️</span>
								</div>
							</div>
						</div>
					</div>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Recent Chats */}
					<div className="lg:col-span-2">
						<div className="bg-white rounded-xl shadow-lg border border-gray-100">
							<div className="p-6 border-b border-gray-200">
								<h2 className="text-xl font-semibold text-gray-900">Recent Chats</h2>
								<p className="text-sm text-gray-600 mt-1">Latest user interactions</p>
							</div>
							<div className="p-6">
								{recentChats.length === 0 ? (
									<p className="text-gray-500 text-center py-8">No chat data available yet</p>
								) : (
									<div className="space-y-4 max-h-96 overflow-y-auto">
										{recentChats.map((chat, index) => (
											<div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
												<div className="flex items-start justify-between mb-2">
													<span className="text-xs text-gray-500">{formatDate(chat.timestamp)}</span>
													<span className={`text-xs px-2 py-1 rounded-full ${
														chat.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
													}`}>
														{chat.success ? 'Success' : 'Failed'}
													</span>
												</div>
												<div className="space-y-2">
													<div>
														<span className="text-xs font-medium text-blue-600">User:</span>
														<p className="text-sm text-gray-800">{formatMessage(chat.userMessage)}</p>
													</div>
													<div>
														<span className="text-xs font-medium text-green-600">Bot:</span>
														<p className="text-sm text-gray-800">{formatMessage(chat.botResponse)}</p>
													</div>
													{chat.sources.length > 0 && (
														<div className="text-xs text-gray-500">
															Sources: {chat.sources.length} • Response time: {chat.responseTime}ms
														</div>
													)}
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Top Topics */}
					<div className="lg:col-span-1">
						<div className="bg-white rounded-xl shadow-lg border border-gray-100">
							<div className="p-6 border-b border-gray-200">
								<h2 className="text-xl font-semibold text-gray-900">Top Topics</h2>
								<p className="text-sm text-gray-600 mt-1">Most discussed subjects</p>
							</div>
							<div className="p-6">
								{topics.length === 0 ? (
									<p className="text-gray-500 text-center py-8">No topic data available yet</p>
								) : (
									<div className="space-y-3">
										{topics.map((topic, index) => (
											<div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
												<div className="flex items-center space-x-3">
													<div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-medium ${
														index === 0 ? 'bg-blue-600' :
														index === 1 ? 'bg-purple-600' :
														index === 2 ? 'bg-green-600' : 'bg-gray-400'
													}`}>
														{index + 1}
													</div>
													<span className="text-sm font-medium text-gray-900">{topic.topic}</span>
												</div>
												<div className="flex items-center space-x-2">
													<span className="text-lg font-semibold text-gray-700">{topic.count}</span>
													<div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
														<div
															className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
															style={{ width: `${Math.min((topic.count / Math.max(...topics.map(t => t.count))) * 100, 100)}%` }}
														/>
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Daily Activity Chart */}
				{dailyStats.length > 0 && (
					<div className="mt-6">
						<div className="bg-white rounded-xl shadow-lg border border-gray-100">
							<div className="p-6 border-b border-gray-200">
								<h2 className="text-xl font-semibold text-gray-900">Daily Activity (Last 30 Days)</h2>
								<p className="text-sm text-gray-600 mt-1">Chat volume and user engagement over time</p>
							</div>
							<div className="p-6">
								<div className="space-y-4 max-h-64 overflow-y-auto">
									{dailyStats.map((day, index) => (
										<div key={index} className="flex items-center space-x-4">
											<div className="w-20 text-sm text-gray-600">
												{new Date(day.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
											</div>
											<div className="flex-1">
												<div className="flex items-center space-x-2">
													<div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
														<div
															className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
															style={{ width: `${Math.max((day.chats / Math.max(...dailyStats.map(d => d.chats))) * 100, 5)}%` }}
														/>
														<span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
															{day.chats} chats
														</span>
													</div>
													<div className="w-16 text-xs text-gray-600 text-right">
														{day.users} users
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Last Updated */}
				<div className="mt-6 text-center text-sm text-gray-500">
					{loading ? 'Updating...' : `Last updated: ${new Date().toLocaleTimeString()}`}
				</div>
			</div>
		</main>
	);
}


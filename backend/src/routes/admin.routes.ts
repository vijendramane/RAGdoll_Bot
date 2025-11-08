import { Router } from 'express';
import { AnalyticsService } from '../services/analytics/AnalyticsService';

const router = Router();

router.get('/schema', async (_req, res) => {
	// TODO: auto-detect schema and suggest table mappings
	return res.json({ productsTable: null, ordersTable: null, usersTable: null });
});

// Analytics endpoints
router.get('/analytics/overview', async (_req, res) => {
	try {
		const overview = await AnalyticsService.getOverview();
		return res.json({ ok: true, data: overview });
	} catch (error) {
		console.error('Failed to fetch analytics overview:', error);
		return res.status(500).json({ error: 'Failed to fetch analytics overview' });
	}
});

router.get('/analytics/chats', async (req, res) => {
	try {
		const limit = parseInt(req.query.limit as string) || 50;
		const recentChats = await AnalyticsService.getRecentChats(limit);
		return res.json({ ok: true, data: recentChats });
	} catch (error) {
		console.error('Failed to fetch recent chats:', error);
		return res.status(500).json({ error: 'Failed to fetch recent chats' });
	}
});

router.get('/analytics/topics', async (_req, res) => {
	try {
		const topics = await AnalyticsService.getTopicAnalysis();
		return res.json({ ok: true, data: topics });
	} catch (error) {
		console.error('Failed to fetch topic analysis:', error);
		return res.status(500).json({ error: 'Failed to fetch topic analysis' });
	}
});

router.get('/analytics/daily', async (req, res) => {
	try {
		const days = parseInt(req.query.days as string) || 30;
		const dailyStats = await AnalyticsService.getDailyStats(days);
		return res.json({ ok: true, data: dailyStats });
	} catch (error) {
		console.error('Failed to fetch daily stats:', error);
		return res.status(500).json({ error: 'Failed to fetch daily stats' });
	}
});

router.get('/analytics/performance', async (_req, res) => {
	try {
		const performance = await AnalyticsService.getPerformanceMetrics();
		return res.json({ ok: true, data: performance });
	} catch (error) {
		console.error('Failed to fetch performance metrics:', error);
		return res.status(500).json({ error: 'Failed to fetch performance metrics' });
	}
});

export default router;


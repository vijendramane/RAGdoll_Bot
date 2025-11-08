import { Router } from 'express';
import { handleQuery } from '../services/chat/ChatService';

const router = Router();

router.post('/', async (req, res) => {
	try {
		const { message, sessionId } = req.body as { message?: string; sessionId?: string };
		if (!message) return res.status(400).json({ error: 'Message is required' });
		const sid = sessionId || 'anon';
		const result = await handleQuery(sid, message);
		return res.json(result);
	} catch (err) {
		const msg = (err as Error).message || 'Unexpected error';
		return res.status(500).json({ error: msg });
	}
});

export default router;


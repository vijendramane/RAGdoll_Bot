import { Router } from 'express';

const router = Router();

router.get('/schema', async (_req, res) => {
	// TODO: auto-detect schema and suggest table mappings
	return res.json({ productsTable: null, ordersTable: null, usersTable: null });
});

export default router;


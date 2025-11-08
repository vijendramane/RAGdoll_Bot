import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === 'GET') {
		try {
			const backend = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
			const params = new URLSearchParams();
			if (req.query.days) params.append('days', req.query.days as string);

			const r = await fetch(`${backend}/api/admin/analytics/daily?${params}`, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});
			const data = await r.json();
			res.status(r.status).json(data);
		} catch (e: any) {
			res.status(500).json({ error: e?.message || 'Proxy error' });
		}
	} else {
		res.status(405).json({ error: 'Method not allowed' });
	}
}
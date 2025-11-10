import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { sourceId } = req.query;
	const backend = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

	try {
		if (req.method === 'GET') {
			const r = await fetch(`${backend}/api/faq/sources/${sourceId}`, {
				method: 'GET',
				headers: { 'content-type': 'application/json' }
			});
			const data = await r.json();
			res.status(r.status).json(data);
		} else if (req.method === 'PUT') {
			const r = await fetch(`${backend}/api/faq/sources/${sourceId}`, {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(req.body)
			});
			const data = await r.json();
			res.status(r.status).json(data);
		} else if (req.method === 'DELETE') {
			const r = await fetch(`${backend}/api/faq/sources/${sourceId}`, {
				method: 'DELETE',
				headers: { 'content-type': 'application/json' }
			});
			const data = await r.json();
			res.status(r.status).json(data);
		} else {
			res.status(405).json({ error: 'Method not allowed' });
		}
	} catch (e: any) {
		res.status(500).json({ error: e?.message || 'Proxy error' });
	}
}
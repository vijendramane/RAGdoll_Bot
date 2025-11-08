import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
	try {
		const backend = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
		const r = await fetch(`${backend}/api/chat`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(req.body)
		});
		const text = await r.text();
		res.status(r.status).send(text);
	} catch (e: any) {
		res.status(500).json({ error: e?.message || 'Proxy error' });
	}
}


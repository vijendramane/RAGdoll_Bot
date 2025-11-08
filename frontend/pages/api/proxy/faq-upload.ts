import type { NextApiRequest, NextApiResponse } from 'next';

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
	try {
		const backend = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
		const chunks: Buffer[] = [];
		await new Promise<void>((resolve, reject) => {
			req.on('data', (c) => chunks.push(Buffer.from(c)));
			req.on('end', () => resolve());
			req.on('error', reject);
		});
		const body = Buffer.concat(chunks);
		const r = await fetch(`${backend}/api/faq/upload`, {
			method: 'POST',
			headers: { 'content-type': (req.headers['content-type'] as string) || 'application/octet-stream' },
			body
		});
		const text = await r.text();
		res.status(r.status).send(text);
	} catch (e: any) {
		res.status(500).json({ error: e?.message || 'Proxy error' });
	}
}


import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthPayload { userId: string; email?: string; }

export function requireAuth(req: Request, res: Response, next: NextFunction) {
	try {
		const header = req.headers.authorization || '';
		const token = header.startsWith('Bearer ') ? header.slice(7) : null;
		if (!token) return res.status(401).json({ error: 'Unauthorized' });
		const secret = process.env.JWT_SECRET || 'change_me';
		const payload = jwt.verify(token, secret) as AuthPayload;
		(req as any).user = payload;
		return next();
	} catch (e) {
		return res.status(401).json({ error: 'Invalid token' });
	}
}


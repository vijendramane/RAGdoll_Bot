import rateLimit from 'express-rate-limit';

const requestsPerHour = Number(process.env.RATE_LIMIT_PER_HOUR || 100);

export const rateLimiter = rateLimit({
	windowMs: 60 * 60 * 1000,
	max: requestsPerHour
});


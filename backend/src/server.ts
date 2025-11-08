import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server as SocketIOServer } from 'socket.io';
import rateLimit from 'express-rate-limit';
import chatRoutes from './routes/chat.routes';
import faqRoutes from './routes/faq.routes';
import setupRoutes from './routes/setup.routes';
import adminRoutes from './routes/admin.routes';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import fs from 'node:fs/promises';
import { seedFAQIfEnabled } from './bootstrap/seedFAQ';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
	cors: { origin: '*'}
});

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

// Ensure required directories exist
(async () => {
	const requiredDirs = ['uploads', 'data'];
	for (const dir of requiredDirs) {
		try {
			await fs.mkdir(dir, { recursive: true });
			console.log(`✓ Directory ensured: ${dir}`);
		} catch (error) {
			console.error(`✗ Failed to create directory ${dir}:`, error);
		}
	}
	// Seed sample FAQ if enabled
	await seedFAQIfEnabled();
})();

const requestsPerHour = Number(process.env.RATE_LIMIT_PER_HOUR || 100);
app.use(rateLimit({ windowMs: 60 * 60 * 1000, max: requestsPerHour }));

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/admin', adminRoutes);

// Swagger
const swaggerSpec = swaggerJSDoc({
	definition: {
		openapi: '3.0.0',
		info: { title: 'Chatbot API', version: '1.0.0' }
	},
	apis: []
});
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Socket.io basics
io.on('connection', (socket) => {
	socket.emit('connected', { ok: true });
});

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

const port = Number(process.env.PORT || 4000);
server.listen(port, () => {
	console.log(`Backend listening on :${port}`);
});


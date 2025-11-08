import { DBConfig } from '../../../shared/types/index';
import { MySQLAdapter } from '../adapters/MySQLAdapter';
import { PostgreSQLAdapter } from '../adapters/PostgreSQLAdapter';
import { MongoDBAdapter } from '../adapters/MongoDBAdapter';
import { DatabaseAdapter } from '../adapters/DatabaseAdapter';
import fs from 'node:fs/promises';
import path from 'node:path';

export function createAdapter(config: DBConfig): DatabaseAdapter {
	if (config.type === 'mysql') return new MySQLAdapter();
	if (config.type === 'postgres') return new PostgreSQLAdapter();
	if (config.type === 'mongodb') return new MongoDBAdapter();
	throw new Error('Unsupported DB type');
}

export async function testConnection(config: DBConfig): Promise<void> {
	const adapter = createAdapter(config);
	await adapter.connect(config);
}

const CONFIG_PATH = path.join(process.cwd(), 'backend', 'data', 'db.config.json');

export async function saveDbConfig(config: DBConfig): Promise<void> {
	await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
	await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

export async function loadDbConfig(): Promise<DBConfig | null> {
	try {
		const raw = await fs.readFile(CONFIG_PATH, 'utf-8');
		return JSON.parse(raw) as DBConfig;
	} catch {
		return null;
	}
}

export async function getConfiguredAdapter(): Promise<DatabaseAdapter | null> {
	const config = await loadDbConfig();
	if (!config) return null;
	const adapter = createAdapter(config);
	await adapter.connect(config);
	return adapter;
}


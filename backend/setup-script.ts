import 'dotenv/config';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { DBConfig } from '../shared/types/index.js';
import { MySQLAdapter } from './src/adapters/MySQLAdapter.js';
import { PostgreSQLAdapter } from './src/adapters/PostgreSQLAdapter.js';
import { MongoDBAdapter } from './src/adapters/MongoDBAdapter.js';

async function main() {
	const rl = readline.createInterface({ input, output });
	try {
		const type = (await rl.question('DB type (mysql/postgres/mongodb): ')).trim() as DBConfig['type'];
		const host = (await rl.question('Host (default: localhost): ')).trim() || 'localhost';
		const portStr = (await rl.question('Port: ')).trim();
		const user = (await rl.question('User: ')).trim();
		const password = (await rl.question('Password: ')).trim();
		const database = (await rl.question('Database name: ')).trim();

		const port = Number(portStr || (type === 'mysql' ? 3306 : type === 'postgres' ? 5432 : 27017));
		const config: DBConfig = { type, host, port, user, password, database };

		let ok = false;
		if (type === 'mysql') {
			const adapter = new MySQLAdapter();
			await adapter.connect(config);
			ok = true;
		} else if (type === 'postgres') {
			const adapter = new PostgreSQLAdapter();
			await adapter.connect(config);
			ok = true;
		} else if (type === 'mongodb') {
			const adapter = new MongoDBAdapter();
			await adapter.connect(config);
			ok = true;
		} else {
			throw new Error('Unsupported DB type');
		}

		if (ok) {
			console.log('Connection successful!');
			// TODO: encrypt and save to config file
		}
	} catch (err) {
		console.error('Setup failed:', (err as Error).message);
	} finally {
		rl.close();
	}
}

main();


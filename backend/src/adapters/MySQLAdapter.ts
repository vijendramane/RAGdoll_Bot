import mysql from 'mysql2/promise';
import { DBConfig, Product, ProductFilter, Order, InventoryStatus } from '../../../shared/types/index';
import { DatabaseAdapter } from './DatabaseAdapter';

export class MySQLAdapter implements DatabaseAdapter {
	private pool!: mysql.Pool;

	async connect(config: DBConfig): Promise<void> {
		this.pool = mysql.createPool({
			host: config.host,
			port: config.port,
			user: config.user,
			password: config.password || '',
			database: config.database,
			connectionLimit: 10
		});
		await this.pool.query('SELECT 1');
	}

	async query(table: string, filters: Record<string, unknown>): Promise<unknown> {
		const where = Object.keys(filters).map((k) => `\`${k}\` = ?`).join(' AND ');
		const params = Object.values(filters);
		const [rows] = await this.pool.query(`SELECT * FROM \`${table}\`${where ? ' WHERE ' + where : ''} LIMIT 100`, params);
		return rows;
	}

	async getProducts(filters: ProductFilter): Promise<Product[]> {
		const rows = await this.query('products', filters) as Product[];
		return rows;
	}

	async getOrderStatus(orderId: string): Promise<Order> {
		const rows = await this.query('orders', { id: orderId }) as Order[];
		if (!rows[0]) throw new Error('Order not found');
		return rows[0];
	}

	async checkInventory(sku: string): Promise<InventoryStatus> {
		const rows = await this.query('inventory', { sku }) as Array<{ sku: string; quantity: number }>;
		const quantity = rows[0]?.quantity ?? 0;
		return { sku, available: quantity > 0, quantity };
	}
}

export default MySQLAdapter;


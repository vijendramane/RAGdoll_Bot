import { Pool } from 'pg';
import { DBConfig, Product, ProductFilter, Order, InventoryStatus } from '../../../shared/types/index';
import { DatabaseAdapter } from './DatabaseAdapter';

export class PostgreSQLAdapter implements DatabaseAdapter {
	private pool!: Pool;

	async connect(config: DBConfig): Promise<void> {
		this.pool = new Pool({
			host: config.host,
			port: config.port,
			user: config.user,
			password: config.password,
			database: config.database,
			max: 10
		});
		await this.pool.query('SELECT 1');
	}

	async query(table: string, filters: Record<string, unknown>): Promise<unknown> {
		const keys = Object.keys(filters);
		const values = Object.values(filters);
		const where = keys.map((k, i) => `"${k}" = $${i + 1}`).join(' AND ');
		const sql = `SELECT * FROM "${table}"${where ? ' WHERE ' + where : ''} LIMIT 100`;
		const { rows } = await this.pool.query(sql, values);
		return rows;
	}

	async getProducts(filters: ProductFilter): Promise<Product[]> {
		return await this.query('products', filters) as Product[];
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

export default PostgreSQLAdapter;


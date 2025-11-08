import { MongoClient, Db } from 'mongodb';
import { DBConfig, Product, ProductFilter, Order, InventoryStatus } from '../../../shared/types/index';
import { DatabaseAdapter } from './DatabaseAdapter';

export class MongoDBAdapter implements DatabaseAdapter {
	private client!: MongoClient;
	private db!: Db;

	async connect(config: DBConfig): Promise<void> {
		const uri = `mongodb://${config.user}:${encodeURIComponent(config.password)}@${config.host}:${config.port}`;
		this.client = new MongoClient(uri);
		await this.client.connect();
		this.db = this.client.db(config.database);
		await this.db.command({ ping: 1 });
	}

	async query(collection: string, filters: Record<string, unknown>): Promise<unknown> {
		return await this.db.collection(collection).find(filters).limit(100).toArray();
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

export default MongoDBAdapter;


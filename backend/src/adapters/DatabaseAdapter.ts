import { DBConfig, Product, ProductFilter, Order, InventoryStatus } from '../../../shared/types/index';

export interface DatabaseAdapter {
	connect(config: DBConfig): Promise<void>;
	query(table: string, filters: Record<string, unknown>): Promise<unknown>;
	getProducts(filters: ProductFilter): Promise<Product[]>;
	getOrderStatus(orderId: string): Promise<Order>;
	checkInventory(sku: string): Promise<InventoryStatus>;
}


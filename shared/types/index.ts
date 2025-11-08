export type SupportedDbType = 'mysql' | 'postgres' | 'mongodb';

export interface DBConfig {
	type: SupportedDbType;
	host: string;
	port: number;
	user: string;
	password: string;
	database: string;
}

export interface ProductFilter {
	sku?: string;
	name?: string;
}

export interface Product {
	id: string;
	sku: string;
	name: string;
	price: number;
	stock: number;
}

export interface Order {
	id: string;
	status: string;
}

export interface InventoryStatus {
	sku: string;
	available: boolean;
	quantity: number;
}


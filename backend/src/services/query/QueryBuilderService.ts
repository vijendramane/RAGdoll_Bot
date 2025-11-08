import { DBConfig } from '../../../../shared/types/index.js';
import { createAdapter } from '../../config/database.config';

export class QueryBuilderService {
	private adapter = createAdapter(this.config);

	constructor(private config: DBConfig) {}

	async connect() { await this.adapter.connect(this.config); }

	async find(table: string, filters: Record<string, unknown>) {
		return await this.adapter.query(table, filters);
	}
}


import fs from 'node:fs/promises';
import path from 'node:path';

export interface FAQSource {
	sourceId: string;
	originalName: string;
	uploadDate: string;
	chunkCount: number;
 fileType: string;
	content?: string;
}

const METADATA_PATH = path.join(process.cwd(), 'data', 'faq-sources.json');

export class FAQSourceService {
	private static async ensureDataDir(): Promise<void> {
		await fs.mkdir(path.dirname(METADATA_PATH), { recursive: true });
	}

	private static async loadSources(): Promise<FAQSource[]> {
		try {
			await this.ensureDataDir();
			const raw = await fs.readFile(METADATA_PATH, 'utf-8');
			return JSON.parse(raw);
		} catch {
			return [];
		}
	}

	private static async saveSources(sources: FAQSource[]): Promise<void> {
		await this.ensureDataDir();
		await fs.writeFile(METADATA_PATH, JSON.stringify(sources, null, 2), 'utf-8');
	}

	static async addSource(source: Omit<FAQSource, 'uploadDate'>): Promise<void> {
		const sources = await this.loadSources();
		const newSource: FAQSource = {
			...source,
			uploadDate: new Date().toISOString()
		};
		sources.push(newSource);
		await this.saveSources(sources);
	}

	static async getAllSources(): Promise<FAQSource[]> {
		return this.loadSources();
	}

	static async getSource(sourceId: string): Promise<FAQSource | null> {
		const sources = await this.loadSources();
		return sources.find(s => s.sourceId === sourceId) || null;
	}

	static async updateSource(sourceId: string, updates: Partial<FAQSource>): Promise<void> {
		const sources = await this.loadSources();
		const index = sources.findIndex(s => s.sourceId === sourceId);
		if (index >= 0) {
			sources[index] = { ...sources[index], ...updates };
			await this.saveSources(sources);
		}
	}

	static async deleteSource(sourceId: string): Promise<void> {
		const sources = await this.loadSources();
		const filtered = sources.filter(s => s.sourceId !== sourceId);
		await this.saveSources(filtered);
	}
}
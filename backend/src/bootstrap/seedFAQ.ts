import fs from 'node:fs/promises';
import path from 'node:path';
import { ingestText } from '../services/rag/IngestionService';

export async function seedFAQIfEnabled() {
    if (process.env.SEED_FAQ !== 'true') return;
    try {
        const baseDir = path.join(process.cwd(), 'backend', 'data');
        const defaultFile = path.join(baseDir, 'faq.sample.txt');
        const faqsDir = path.join(baseDir, 'faqs');

        // Ingest default sample if present
        try {
            const text = await fs.readFile(defaultFile, 'utf-8');
            await ingestText('seed-faq', text);
            console.log('[seed] Default FAQ sample ingested');
        } catch {}

        // Ingest any txt/md/json files inside data/faqs
        try {
            const files = await fs.readdir(faqsDir);
            for (const f of files) {
                const ext = f.toLowerCase().split('.').pop();
                if (!ext || !['txt', 'md', 'json'].includes(ext)) continue;
                const content = await fs.readFile(path.join(faqsDir, f), 'utf-8');
                const text = ext === 'json' ? jsonToText(content) : content;
                await ingestText(`seed-${f}`, text);
                console.log(`[seed] Ingested ${f}`);
            }
        } catch {}
    } catch (e) {
        console.warn('[seed] FAQ ingestion skipped:', (e as Error).message);
    }
}

function jsonToText(jsonStr: string): string {
    try {
        const obj = JSON.parse(jsonStr);
        if (Array.isArray(obj)) {
            return obj.map((x) => formatKV(x)).join('\n\n');
        }
        return formatKV(obj);
    } catch {
        return jsonStr;
    }
}

function formatKV(rec: Record<string, unknown>): string {
    return Object.entries(rec).map(([k, v]) => `${k}: ${String(v)}`).join('\n');
}


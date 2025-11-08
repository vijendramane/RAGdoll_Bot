import xlsx from 'xlsx';
import pdfParse from 'pdf-parse';
import fs from 'node:fs/promises';
import mammoth from 'mammoth';

export async function readFileAsText(filePath: string, originalName: string): Promise<string> {
	const ext = (originalName.split('.').pop() || '').toLowerCase();
    if (ext === 'txt') {
        return await fs.readFile(filePath, 'utf-8');
    }
    if (ext === 'json') {
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.stringify(JSON.parse(content));
    }
    if (ext === 'csv') {
        const content = await fs.readFile(filePath, 'utf-8');
        return content;
    }
    if (ext === 'xlsx' || ext === 'xls') {
        const buf = await fs.readFile(filePath);
        const wb = xlsx.read(buf);
		const first = wb.SheetNames[0];
		return xlsx.utils.sheet_to_csv(wb.Sheets[first]);
	}
	if (ext === 'pdf') {
        const buf = await fs.readFile(filePath);
        const data = await pdfParse(buf);
		return data.text;
	}
    if (ext === 'docx') {
        const buf = await fs.readFile(filePath);
        const result = await mammoth.extractRawText({ buffer: buf });
        return result.value || '';
    }
	throw new Error('Unsupported file type');
}


export function chunkText(text: string, chunkSize = 400, overlap = 40): string[] {
	const words = text.split(/\s+/);
	const chunks: string[] = [];
	let i = 0;
	while (i < words.length) {
		const end = Math.min(i + chunkSize, words.length);
		chunks.push(words.slice(i, end).join(' '));
		i = end - overlap;
		if (i < 0) i = 0;
	}
	return chunks.filter(Boolean);
}


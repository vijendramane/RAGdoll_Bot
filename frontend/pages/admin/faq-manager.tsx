import React, { useState } from 'react';
import { Spinner } from '../../components/Spinner';

export default function FAQManager() {
	const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

	async function upload() {
		if (!file) return;
        setStatus('Uploading...');
        setUploading(true);
		const form = new FormData();
		form.append('file', file);
		try {
			const res = await fetch(`/api/proxy/faq-upload`, { method: 'POST', body: form });
			const data = await res.json().catch(() => ({ error: `Server error: ${res.status}` }));
            setStatus(res.ok ? `Uploaded. Chunks: ${data.chunks}` : data.error || 'Upload failed');
		} catch (e: any) {
			setStatus(`Failed to upload: ${e?.message || 'network error'}. Check NEXT_PUBLIC_API_URL and backend status.`);
        } finally { setUploading(false); }
	}

	return (
		<main className="max-w-2xl mx-auto p-6">
			<h1 className="text-2xl font-semibold">FAQ Manager</h1>
			<p className="text-gray-600 mt-2">Upload CSV, JSON, XLSX, PDF, or TXT.</p>
            <div className="mt-4 flex items-center gap-2">
                <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                <button disabled={uploading} className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50" onClick={upload}>
                    {uploading ? 'Uploading…' : 'Upload'}
                </button>
                {uploading && <Spinner />}
            </div>
            {status && <p className="mt-2 text-sm">{status}</p>}
		</main>
	);
}


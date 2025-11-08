import React, { useState, useEffect } from 'react';
import { Spinner } from '../../components/Spinner';

interface FAQSource {
	sourceId: string;
	originalName: string;
	uploadDate: string;
	chunkCount: number;
	fileType: string;
	content?: string;
}

export default function FAQManager() {
	const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
	const [sources, setSources] = useState<FAQSource[]>([]);
	const [loading, setLoading] = useState(true);
	const [editingSource, setEditingSource] = useState<FAQSource | null>(null);
	const [editMode, setEditMode] = useState<'text' | 'qa'>('text');
	const [editContent, setEditContent] = useState('');
	const [saving, setSaving] = useState(false);

	// Load FAQ sources on mount
	useEffect(() => {
		loadSources();
	}, []);

	async function loadSources() {
		try {
			const res = await fetch('/api/proxy/faq-sources');
			if (res.ok) {
				const data = await res.json();
				setSources(data.items || []);
			}
		} catch (error) {
			console.error('Failed to load FAQ sources:', error);
		} finally {
			setLoading(false);
		}
	}

	async function upload() {
		if (!file) return;
        setStatus('Uploading...');
        setUploading(true);
		const form = new FormData();
		form.append('file', file);
		try {
			const res = await fetch(`/api/proxy/faq-upload`, { method: 'POST', body: form });
			const data = await res.json().catch(() => ({ error: `Server error: ${res.status}` }));
            if (res.ok) {
				setStatus(`Uploaded. Chunks: ${data.chunks}`);
				await loadSources(); // Refresh the list
			} else {
				setStatus(data.error || 'Upload failed');
			}
		} catch (e: any) {
			setStatus(`Failed to upload: ${e?.message || 'network error'}. Check NEXT_PUBLIC_API_URL and backend status.`);
        } finally { setUploading(false); }
	}

	async function startEdit(source: FAQSource) {
		try {
			const res = await fetch(`/api/proxy/faq-sources/${source.sourceId}`);
			if (res.ok) {
				const data = await res.json();
				setEditingSource(data);
				setEditContent(data.content || '');
				setEditMode('text');
			}
		} catch (error) {
			console.error('Failed to load FAQ source for editing:', error);
			setStatus('Failed to load FAQ source for editing');
		}
	}

	async function saveEdit() {
		if (!editingSource) return;
		setSaving(true);
		try {
			const res = await fetch(`/api/proxy/faq-sources/${editingSource.sourceId}`, {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ content: editContent, mode: editMode })
			});
			const data = await res.json();
			if (res.ok) {
				setStatus(`FAQ content updated successfully. Chunks: ${data.chunkCount}`);
				setEditingSource(null);
				setEditContent('');
				await loadSources(); // Refresh the list
			} else {
				setStatus(data.error || 'Failed to update FAQ content');
			}
		} catch (error) {
			setStatus('Failed to update FAQ content');
		} finally {
			setSaving(false);
		}
	}

	async function deleteSource(sourceId: string, originalName: string) {
		if (!confirm(`Are you sure you want to delete "${originalName}"?`)) return;
		try {
			const res = await fetch(`/api/proxy/faq-sources/${sourceId}`, {
				method: 'DELETE'
			});
			const data = await res.json();
			if (res.ok) {
				setStatus(data.message || 'FAQ source deleted successfully');
				await loadSources(); // Refresh the list
			} else {
				setStatus(data.error || 'Failed to delete FAQ source');
			}
		} catch (error) {
			setStatus('Failed to delete FAQ source');
		}
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString();
	};

	return (
		<main className="max-w-6xl mx-auto p-6">
			<h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
				FAQ Manager
			</h1>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Upload Section */}
				<div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
					<h2 className="text-xl font-semibold mb-4">Upload New FAQ</h2>
					<p className="text-gray-600 text-sm mb-4">Upload CSV, JSON, XLSX, PDF, or TXT files.</p>

					<div className="space-y-4">
						<div>
							<input
								type="file"
								onChange={(e) => setFile(e.target.files?.[0] || null)}
								className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
							/>
						</div>

						<div className="flex items-center gap-2">
							<button
								disabled={uploading || !file}
								className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white disabled:opacity-50 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
								onClick={upload}
							>
								{uploading ? 'Uploading…' : 'Upload'}
							</button>
							{uploading && <Spinner />}
						</div>

						{status && (
							<div className={`p-3 rounded-lg text-sm ${
								status.includes('success') || status.includes('Uploaded')
									? 'bg-green-50 text-green-700 border border-green-200'
									: 'bg-red-50 text-red-700 border border-red-200'
							}`}>
								{status}
							</div>
						)}
					</div>
				</div>

				{/* Files List Section */}
				<div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
					<h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>

					{loading ? (
						<div className="flex justify-center py-8">
							<Spinner />
						</div>
					) : sources.length === 0 ? (
						<p className="text-gray-500 text-center py-8">No FAQ files uploaded yet</p>
					) : (
						<div className="space-y-3 max-h-96 overflow-y-auto">
							{sources.map((source) => (
								<div key={source.sourceId} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
									<div className="flex items-center justify-between">
										<div className="flex-1 min-w-0">
											<h3 className="font-medium text-gray-900 truncate">{source.originalName}</h3>
											<p className="text-sm text-gray-500">
												{formatDate(source.uploadDate)} • {source.chunkCount} chunks • {source.fileType.toUpperCase()}
											</p>
										</div>
										<div className="flex items-center gap-2 ml-4">
											<button
												onClick={() => startEdit(source)}
												className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
											>
												Edit
											</button>
											<button
												onClick={() => deleteSource(source.sourceId, source.originalName)}
												className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
											>
												Delete
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Edit Modal */}
			{editingSource && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-xl">
						<div className="p-6 border-b border-gray-200">
							<div className="flex items-center justify-between">
								<h3 className="text-xl font-semibold">Edit FAQ: {editingSource.originalName}</h3>
								<button
									onClick={() => setEditingSource(null)}
									className="text-gray-400 hover:text-gray-600"
								>
									✕
								</button>
							</div>

							<div className="flex gap-2 mt-4">
								<button
									onClick={() => setEditMode('text')}
									className={`px-3 py-1 rounded-md text-sm ${
										editMode === 'text'
											? 'bg-blue-100 text-blue-700'
											: 'bg-gray-100 text-gray-700'
									}`}
								>
									Edit as Text
								</button>
								<button
									onClick={() => setEditMode('qa')}
									className={`px-3 py-1 rounded-md text-sm ${
										editMode === 'qa'
											? 'bg-blue-100 text-blue-700'
											: 'bg-gray-100 text-gray-700'
									}`}
								>
									Edit as Q&A
								</button>
							</div>
						</div>

						<div className="p-6 overflow-y-auto max-h-[50vh]">
							<textarea
								value={editContent}
								onChange={(e) => setEditContent(e.target.value)}
								className="w-full h-96 p-3 border border-gray-300 rounded-md font-mono text-sm"
								placeholder="Enter FAQ content here..."
							/>
						</div>

						<div className="p-6 border-t border-gray-200 flex justify-end gap-3">
							<button
								onClick={() => setEditingSource(null)}
								className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								onClick={saveEdit}
								disabled={saving}
								className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
							>
								{saving ? 'Saving…' : 'Save Changes'}
							</button>
						</div>
					</div>
				</div>
			)}
		</main>
	);
}


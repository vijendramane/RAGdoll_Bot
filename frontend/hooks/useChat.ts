import { useCallback, useState } from 'react';

type Msg = { role: 'user' | 'assistant'; content: string; ts?: number; sources?: string[]; options?: any[] };

export function useChat() {
	const [messages, setMessages] = useState<Msg[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const send = useCallback(async (text: string) => {
		setError(null);
		setMessages((m) => [...m, { role: 'user', content: text, ts: Date.now() }]);
		setLoading(true);
		try {
			const res = await fetch(`/api/proxy/chat`, {
				method: 'POST', 
				headers: { 'Content-Type': 'application/json' }, 
				body: JSON.stringify({ message: text, sessionId: 'web' })
			});
			
			if (!res.ok) {
				const errorData = await res.json().catch(() => ({ error: `Server error: ${res.status}` }));
				throw new Error(errorData.error || `Request failed with status ${res.status}`);
			}
			
			const data = await res.json();
			if (!data.answer) throw new Error('No response from server');
			
			setMessages((m) => [...m, { role: 'assistant', content: data.answer, ts: Date.now(), sources: data.sources, options: data.clarification }]);
		} catch (e: any) {
			const errorMsg = e.message || 'Failed to connect to server. Make sure the backend is running.';
			setError(errorMsg);
			console.error('Chat error:', e);
		} finally {
			setLoading(false);
		}
	}, []);

	// expose typing status by adding a placeholder assistant bubble when loading
	if (loading && (messages.length === 0 || messages[messages.length - 1]?.role !== 'assistant')) {
		// no-op: TypingIndicator is already shown in UI; messages remain clean
	}

	return { messages, send, loading, error } as const;
}


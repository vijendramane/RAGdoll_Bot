import React, { useState } from 'react';
import { VoiceInput } from './VoiceInput';

export function ChatComposer({ onSend, loading }: { onSend: (text: string) => void; loading?: boolean }) {
	const [value, setValue] = useState('');
	function submit() {
		if (!value.trim() || loading) return;
		onSend(value.trim());
		setValue('');
	}
	return (
		<div className="border-t bg-white/70 backdrop-blur px-4 py-3">
			<div className="flex items-end gap-2">
				<div className="flex-1 relative">
					<textarea
						className="w-full resize-none rounded-xl border border-black dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
						rows={1}
						placeholder="Ask about products, orders, shipping, returns..."
						value={value}
						onChange={(e) => setValue(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
						}}
						disabled={!!loading}
					/>
					<div className="absolute right-2 bottom-2">
						<VoiceInput onFinal={(t) => { if (t) setValue((prev) => (prev ? (prev + ' ' + t).trim() : t)); }} />
					</div>
				</div>
					<button className="h-11 px-6 rounded-xl bg-blue-600 text-white disabled:opacity-50 transition-transform active:scale-[0.98]" disabled={!value.trim() || !!loading} onClick={submit}>
					{loading ? 'Sending…' : 'Send'}
				</button>
			</div>
			<div className="mt-2 text-[11px] text-gray-500">Press Enter to send • Shift+Enter for newline</div>
		</div>
	);
}


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
		<div className="border-t bg-gradient-to-r from-gray-50 to-white px-4 py-4">
			<div className="flex items-end gap-3">
				<div className="flex-1 relative">
					<textarea
						className="w-full resize-none rounded-xl border border-gray-300 bg-white text-gray-900 px-4 py-3 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
						rows={1}
						placeholder="Ask about products, orders, shipping, returns..."
						value={value}
						onChange={(e) => setValue(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
						}}
						disabled={!!loading}
					/>
					<div className="absolute right-3 bottom-3">
						<VoiceInput onFinal={(t) => { if (t) setValue((prev) => (prev ? (prev + ' ' + t).trim() : t)); }} />
					</div>
				</div>
				<button
					className={`h-11 px-6 rounded-xl font-medium transition-all duration-200 transform active:scale-[0.98] shadow-md hover:shadow-lg ${
						loading
							? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
							: value.trim()
							? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
							: 'bg-gray-200 text-gray-400 cursor-not-allowed'
					}`}
					disabled={!value.trim() || !!loading}
					onClick={submit}
				>
					{loading ? (
						<div className="flex items-center gap-2">
							<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
							<span>Sending</span>
						</div>
					) : (
						<div className="flex items-center gap-2">
							<span>Send</span>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
							</svg>
						</div>
					)}
				</button>
			</div>
			<div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
				<span className="w-1 h-1 bg-blue-500 rounded-full"></span>
				Press Enter to send • Shift+Enter for newline
			</div>
		</div>
	);
}


import React, { useState } from 'react';
import { useChat } from '../hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { OptionCards } from './OptionCards';
import { SourceCitation } from './SourceCitation';
import { VoiceInput } from './VoiceInput';

export function ChatWidget() {
	const { messages, send, loading, error } = useChat();
	const [input, setInput] = useState('');

	return (
		<div className="fixed inset-0 pointer-events-none">
			<div className="pointer-events-auto fixed bottom-6 right-6 w-[28rem] max-w-[92vw] chat-gradient">
				<div className="glass rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-gray-200">
					<div className="px-5 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center gap-3">
						<div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white grid place-items-center font-semibold shadow-md">
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
							</svg>
						</div>
						<div className="flex-1">
							<div className="font-semibold text-gray-900">Assistant</div>
							<div className="text-xs text-gray-600 flex items-center gap-1">
								<span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
								Online
							</div>
						</div>
					</div>
					<div className="px-4 py-3 overflow-auto flex-1 space-y-2">
						{messages.length === 0 && (
							<div className="text-center py-8 text-gray-500">
								<div className="text-4xl mb-2">👋</div>
								<div className="font-medium mb-1">Welcome to your assistant</div>
								<div className="text-sm">Ask me about products, orders, shipping, returns, or anything else!</div>
							</div>
						)}
						{messages.map((m, idx) => (
							<div key={idx}>
								<MessageBubble role={m.role} content={m.content} ts={m.ts} />
								{m.sources && <SourceCitation sources={m.sources} />}
								{m.options && <OptionCards options={m.options} onSelect={(o) => send(o.text)} />}
							</div>
						))}
						{loading && <TypingIndicator />}
					</div>
					<div className="px-4 py-3 border-t bg-white/80 backdrop-blur">
						<div className="flex items-end gap-2">
							<div className="flex-1 relative">
								<textarea
									className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									rows={1}
									placeholder="Ask about products, orders, shipping, returns..."
									value={input}
									onChange={(e) => setInput(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === 'Enter' && !e.shiftKey) {
											e.preventDefault();
											if (input.trim() && !loading) { send(input.trim()); setInput(''); }
										}
									}}
									disabled={loading}
								/>
								<div className="absolute right-2 bottom-2">
									<VoiceInput onFinal={(t) => { if (t && !loading) send(t); }} />
								</div>
							</div>
							<button
								className="h-11 px-6 rounded-xl bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors font-medium"
								disabled={!input.trim() || loading}
								onClick={() => { if (input.trim() && !loading) { send(input.trim()); setInput(''); } }}
							>
								{loading ? 'Sending...' : 'Send'}
							</button>
						</div>
						<div className="mt-2 text-[11px] text-gray-500 flex items-center justify-between">
							<span>Press Enter to send • Shift+Enter for newline</span>
							{error && <span className="text-red-600">{error}</span>}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}


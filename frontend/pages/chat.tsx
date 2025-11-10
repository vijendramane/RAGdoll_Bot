import React from 'react';
import { ChatLayout } from '../components/ChatLayout';
import { useChat } from '../hooks/useChat';
import { ChatMessage } from '../components/ChatMessage';
import { ChatComposer } from '../components/ChatComposer';
import { TypingIndicator } from '../components/TypingIndicator';

export default function FullChat() {
	const { messages, send, loading, error } = useChat();
	return (
		<ChatLayout>
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				<section className="lg:col-span-3">
					<div className="rounded-2xl border bg-white overflow-hidden shadow-lg">
						<div className="h-[60vh] md:h-[65vh] overflow-auto px-6 py-4 bg-gradient-to-b from-gray-50 to-white">
							{messages.length === 0 && !loading && (
								<div className="text-center py-12">
									<div className="text-6xl mb-4">🤖</div>
									<h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
										Welcome to Your AI Assistant
									</h2>
									<p className="text-gray-600 mb-6">Ask about products, orders, shipping, returns, and more</p>
									<div className="flex flex-wrap justify-center gap-2">
										{[
											'📦 Track my order',
											'🔍 Find products',
											'📋 Return policy',
											'🚚 Shipping info',
											'💳 Payment help'
										].map((t) => (
											<button
												key={t}
												className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-sm border border-gray-200 hover:border-blue-300 transition-all duration-200"
												onClick={() => send(t)}
											>
												{t}
											</button>
										))}
									</div>
								</div>
							)}
							{messages.map((m, i) => (
								<ChatMessage key={i} role={m.role} content={m.content} ts={m.ts} />
							))}
							{loading && <TypingIndicator />}
						</div>
						{error && (
							<div className="px-6 py-3 bg-red-50 border-t border-red-200">
								<div className="text-sm text-red-600 flex items-center gap-2">
									<span className="text-red-500">⚠️</span>
									{error}
								</div>
							</div>
						)}
						<ChatComposer onSend={send} loading={loading} />
					</div>
				</section>
				<aside className="hidden lg:block lg:col-span-1 space-y-4">
					<div className="rounded-2xl border bg-gradient-to-br from-blue-50 to-purple-50 p-4 border-blue-100">
						<div className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
							<span className="text-lg">⚡</span>
							Quick Actions
						</div>
						<div className="space-y-2">
							{[
								{ icon: '📦', text: 'Check Order Status' },
								{ icon: '🔍', text: 'Find Product' },
								{ icon: '🔄', text: 'Return Policy' },
								{ icon: '🚚', text: 'Shipping Fees' },
								{ icon: '💬', text: 'Contact Support' }
							].map((item) => (
								<button
									key={item.text}
									className="w-full text-left px-3 py-2 rounded-lg bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 text-sm border border-gray-200 hover:border-blue-200 transition-all duration-200 flex items-center gap-2"
									onClick={() => send(item.text)}
								>
									<span>{item.icon}</span>
									<span>{item.text}</span>
								</button>
							))}
						</div>
					</div>
					<div className="rounded-2xl border bg-gradient-to-br from-green-50 to-blue-50 p-4 border-green-100">
						<div className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
							<span className="text-lg">💡</span>
							Pro Tips
						</div>
						<ul className="text-sm text-gray-700 space-y-2">
							<li className="flex items-start gap-2">
								<span className="text-green-500 mt-0.5">•</span>
								<span>Provide order ID for faster tracking</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-blue-500 mt-0.5">•</span>
								<span>Ask for products by name or SKU</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-purple-500 mt-0.5">•</span>
								<span>Use voice input with the microphone</span>
							</li>
						</ul>
					</div>
				</aside>
			</div>
		</ChatLayout>
	);
}


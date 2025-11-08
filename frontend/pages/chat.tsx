import React from 'react';
import { ChatLayout } from '../components/ChatLayout';
import { useChat } from '../hooks/useChat';
import { ChatMessage } from '../components/ChatMessage';
import { ChatComposer } from '../components/ChatComposer';

export default function FullChat() {
	const { messages, send, loading, error } = useChat();
	return (
		<ChatLayout>
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				<section className="lg:col-span-3">
					<div className="rounded-2xl border bg-white overflow-hidden">
						<div className="h-[60vh] md:h-[65vh] overflow-auto px-6 py-4">
							{messages.length === 0 && (
								<div className="text-center py-12 text-gray-500">
									<div className="text-5xl mb-3">👋</div>
									<div className="font-medium mb-1">Welcome to your assistant</div>
									<div className="text-sm">Ask about products, availability, orders, returns, shipping and more.</div>
								</div>
							)}
							{messages.map((m, i) => (
								<ChatMessage key={i} role={m.role} content={m.content} ts={m.ts} />
							))}
						</div>
						{error && <div className="px-6 text-sm text-red-600">{error}</div>}
						<ChatComposer onSend={send} loading={loading} />
					</div>
				</section>
				<aside className="hidden lg:block lg:col-span-1 space-y-4">
					<div className="rounded-2xl border bg-white p-4">
						<div className="font-medium mb-2">Quick actions</div>
						<div className="flex flex-wrap gap-2">
							{['Check order status','Find a product','Return policy','Shipping fees','Contact support'].map((t) => (
								<button key={t} className="px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-sm" onClick={() => send(t)}>{t}</button>
							))}
						</div>
					</div>
					<div className="rounded-2xl border bg-white p-4">
						<div className="font-medium mb-2">Tips</div>
						<ul className="text-sm text-gray-600 list-disc pl-4 space-y-1">
							<li>Provide order ID for faster tracking</li>
							<li>Ask for product by name or SKU</li>
							<li>Use voice with the mic icon</li>
						</ul>
					</div>
				</aside>
			</div>
		</ChatLayout>
	);
}


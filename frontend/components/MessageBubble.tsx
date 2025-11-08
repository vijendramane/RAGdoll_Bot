import React from 'react';
import ReactMarkdown from 'react-markdown';

export function MessageBubble({ role, content, ts }: { role: 'user' | 'assistant'; content: string; ts?: number }) {
	const isUser = role === 'user';
	return (
		<div className={`flex ${isUser ? 'justify-end' : 'justify-start'} my-2`}>
			<div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${isUser ? 'bg-blue-600 text-white' : 'glass'}`}>
				<div className="prose prose-sm max-w-none dark:prose-invert">
					<ReactMarkdown>{content}</ReactMarkdown>
				</div>
				{ts && <div className={`text-[10px] mt-1 ${isUser ? 'opacity-80' : 'text-gray-500'}`}>{new Date(ts).toLocaleTimeString()}</div>}
			</div>
		</div>
	);
}


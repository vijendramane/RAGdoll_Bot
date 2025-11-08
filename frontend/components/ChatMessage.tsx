import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';

export function ChatMessage({ role, content, ts }: { role: 'user' | 'assistant'; content: string; ts?: number }) {
	const isUser = role === 'user';
	return (
		<div className={`flex ${isUser ? 'justify-end' : 'justify-start'} py-2 items-start gap-2`}>
			{!isUser && (
				<div className="h-8 w-8 rounded-full bg-blue-600 text-white grid place-items-center text-xs font-semibold">A</div>
			)}
			<motion.div initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 280, damping: 24 }} className={`max-w-[70ch] rounded-2xl px-4 py-3 shadow-sm ${isUser ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white' : 'bg-white border dark:bg-gray-900 dark:border-gray-800'} `}>
				<div className="prose prose-sm max-w-none dark:prose-invert">
					<ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
				</div>
				{ts && <div className={`text-[10px] mt-1 ${isUser ? 'opacity-90' : 'text-gray-500'}`}>{new Date(ts).toLocaleTimeString()}</div>}
			</motion.div>
			{isUser && (
				<div className="h-8 w-8 rounded-full bg-gray-200 text-gray-700 grid place-items-center text-xs font-semibold">U</div>
			)}
		</div>
	);
}


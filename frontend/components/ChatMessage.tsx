import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';

export function ChatMessage({ role, content, ts }: { role: 'user' | 'assistant'; content: string; ts?: number }) {
	const isUser = role === 'user';
	return (
		<div className={`flex ${isUser ? 'justify-end' : 'justify-start'} py-2 items-start gap-2`}>
			{!isUser && (
				<div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white grid place-items-center text-xs font-semibold shadow-lg flex-shrink-0">
					AI
				</div>
			)}
			<motion.div
				initial={{ opacity: 0, y: 8, scale: 0.98 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ type: 'spring', stiffness: 280, damping: 24 }}
				className={`max-w-[70ch] rounded-2xl px-4 py-3 shadow-md ${
					isUser
						? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-blue-500/25'
						: 'bg-white border border-gray-200 shadow-gray-200/50'
				} backdrop-blur-sm`}
			>
				<div className="prose prose-sm max-w-none dark:prose-invert">
					<ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
				</div>
				{ts && (
					<div className={`text-[10px] mt-2 flex items-center gap-1 ${
						isUser ? 'text-blue-100 opacity-90' : 'text-gray-400'
					}`}>
						<span className="w-1 h-1 bg-current rounded-full"></span>
						{new Date(ts).toLocaleTimeString()}
					</div>
				)}
			</motion.div>
			{isUser && (
				<div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 text-white grid place-items-center text-xs font-semibold shadow-lg flex-shrink-0">
					U
				</div>
			)}
		</div>
	);
}


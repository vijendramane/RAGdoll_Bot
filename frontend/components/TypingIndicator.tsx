import React from 'react';
import { motion } from 'framer-motion';

export function TypingIndicator() {
	return (
		<div className="flex justify-start py-2 items-start gap-2">
			<div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white grid place-items-center text-xs font-semibold shadow-lg">
				AI
			</div>
			<motion.div
				initial={{ opacity: 0, y: 8, scale: 0.98 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ type: 'spring', stiffness: 280, damping: 24 }}
				className="max-w-[70ch] rounded-2xl px-4 py-3 shadow-sm bg-white border border-gray-200"
			>
				<div className="flex items-center gap-2">
					<div className="flex gap-1">
						<motion.div
							className="w-2 h-2 bg-blue-600 rounded-full"
							animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
							transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
						/>
						<motion.div
							className="w-2 h-2 bg-purple-600 rounded-full"
							animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
							transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
						/>
						<motion.div
							className="w-2 h-2 bg-indigo-600 rounded-full"
							animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
							transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
						/>
					</div>
					<span className="text-sm text-gray-600 ml-1">Thinking</span>
				</div>
			</motion.div>
		</div>
	);
}


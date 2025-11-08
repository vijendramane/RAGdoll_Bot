import React from 'react';
import { ThemeToggle } from './ThemeToggle';

export function ChatLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
			<header className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b">
				<div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
					<div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white grid place-items-center shadow">
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
						</svg>
					</div>
					<div className="flex-1">
						<div className="font-semibold text-gray-900">Assistant</div>
						<div className="text-xs text-gray-600">Ready to help with products, orders, shipping, and returns</div>
					</div>
					<ThemeToggle />
				</div>
			</header>
			<main className="max-w-6xl mx-auto px-6 py-6">
				{children}
			</main>
		</div>
	);
}


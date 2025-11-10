import React from 'react';
import { ThemeToggle } from './ThemeToggle';

export function ChatLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
			<header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
				<div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
					<div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white grid place-items-center shadow-lg flex-shrink-0">
						<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
						</svg>
					</div>
					<div className="flex-1">
						<div className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-lg">
							RAGdoll AI Assistant
						</div>
						<div className="text-sm text-gray-600 flex items-center gap-2">
							<span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
							Online • Ready to help with products, orders, and returns
						</div>
					</div>
					<div className="flex items-center gap-3">
						<a
							href="/admin"
							className="px-4 py-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-sm font-medium text-gray-700 transition-all duration-200"
						>
							Admin Panel
						</a>
						<ThemeToggle />
					</div>
				</div>
			</header>
			<main className="max-w-7xl mx-auto px-6 py-6">
				{children}
			</main>
		</div>
	);
}


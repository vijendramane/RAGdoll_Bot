import React, { useEffect, useState } from 'react';

export function ThemeToggle() {
	const [theme, setTheme] = useState<'light' | 'dark'>(() => (typeof window !== 'undefined' ? ((localStorage.getItem('theme') as 'light' | 'dark') || 'light') : 'light'));
	useEffect(() => {
		document.documentElement.classList.toggle('dark', theme === 'dark');
		localStorage.setItem('theme', theme);
	}, [theme]);
	return (
		<button
			onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
			className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-200 grid place-items-center border"
			title="Toggle theme"
			aria-label="Toggle theme"
		>
			{theme === 'dark' ? (
				<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M21.64 13a9 9 0 01-11.31 8.94A9 9 0 1012 3a7 7 0 009.64 10z"/></svg>
			) : (
				<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm0 17a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zM4.22 5.64a1 1 0 011.42 0l1.42 1.42a1 1 0 11-1.42 1.42L4.22 7.06a1 1 0 010-1.42zM16.94 18.36a1 1 0 011.42 0l1.42 1.42a1 1 0 11-1.42 1.42l-1.42-1.42a1 1 0 010-1.42zM2 13a1 1 0 110-2h2a1 1 0 110 2H2zm17 0a1 1 0 110-2h2a1 1 0 110 2h-2zM4.22 18.36a1 1 0 000 1.42l1.42 1.42a1 1 0 001.42-1.42L5.64 18.36a1 1 0 00-1.42 0zM16.94 5.64a1 1 0 000 1.42l1.42 1.42a1 1 0 001.42-1.42L18.36 5.64a1 1 0 00-1.42 0z"/></svg>
			)}
		</button>
	);
}


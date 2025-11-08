import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { useEffect, useState } from 'react';

export default function App({ Component, pageProps }: AppProps) {
	const [theme, setTheme] = useState<'light' | 'dark'>(() => (typeof window !== 'undefined' ? ((localStorage.getItem('theme') as 'light' | 'dark') || 'light') : 'light'));
	useEffect(() => {
		document.documentElement.classList.toggle('dark', theme === 'dark');
		localStorage.setItem('theme', theme);
	}, [theme]);
	return <Component {...pageProps} />;
}


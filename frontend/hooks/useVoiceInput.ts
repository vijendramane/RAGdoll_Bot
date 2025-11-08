import { useCallback, useEffect, useRef, useState } from 'react';

type RecognitionType = typeof window extends any ? (any) : never;

export function useVoiceInput(lang: string = 'en-US') {
	const [supported, setSupported] = useState(false);
	const [listening, setListening] = useState(false);
	const [transcript, setTranscript] = useState('');
	const recognitionRef = useRef<RecognitionType | null>(null);

	useEffect(() => {
		const Rec: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
		if (Rec) {
			const rec = new Rec();
			rec.continuous = false;
			rec.interimResults = true;
			rec.lang = lang;
			rec.onresult = (event: any) => {
				const t = Array.from(event.results).map((r: any) => r[0].transcript).join('');
				setTranscript(t);
			};
			rec.onend = () => setListening(false);
			rec.onerror = () => setListening(false);
			rec.onstart = () => setListening(true);
			recognitionRef.current = rec;
			setSupported(true);
		}
	}, [lang]);

	const start = useCallback(() => { recognitionRef.current?.start?.(); }, []);
	const stop = useCallback(() => { recognitionRef.current?.stop?.(); }, []);

	return { supported, listening, transcript, start, stop, setTranscript } as const;
}


import React, { useEffect } from 'react';
import { useVoiceInput } from '../hooks/useVoiceInput';

export function VoiceInput({ onFinal }: { onFinal: (text: string) => void }) {
	const { supported, listening, transcript, start, stop, setTranscript } = useVoiceInput();

	useEffect(() => {
		// When recording stops, pass the transcript back to the composer, but do NOT send.
		if (!listening && transcript) {
			onFinal(transcript);
			setTranscript('');
		}
	}, [transcript, listening, onFinal, setTranscript]);

	if (!supported) return null;

	return (
		<button
			onClick={listening ? stop : start}
			className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
				listening 
					? 'bg-red-500 text-white animate-pulse' 
					: 'bg-gray-100 hover:bg-gray-200 text-gray-600'
			}`}
			aria-label={listening ? 'Stop recording' : 'Start voice input'}
			title={listening ? 'Stop recording' : 'Voice input'}
		>
			<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				{listening ? (
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				) : (
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
				)}
			</svg>
		</button>
	);
}


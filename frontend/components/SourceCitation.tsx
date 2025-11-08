import React from 'react';

export function SourceCitation({ sources }: { sources: string[] }) {
	if (!sources?.length) return null;
	return (
		<div className="text-xs text-gray-500 mt-1">
			Sources: {sources.map((s, i) => <span key={i} className="underline decoration-dotted mr-2">{s}</span>)}
		</div>
	);
}


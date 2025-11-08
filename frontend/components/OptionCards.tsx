import React from 'react';

export type Option = { id: number; text: string; icon: string; confidence?: number };

export function OptionCards({ options, onSelect }: { options: Option[]; onSelect: (o: Option) => void }) {
	return (
		<div className="grid grid-cols-1 gap-2 mt-3">
			{options.map((o) => (
				<button key={o.id} className="px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-sm transition" onClick={() => onSelect(o)}>
					<span className="mr-1">{o.icon}</span>{o.text}
					{o.confidence != null && <span className="ml-2 text-xs text-gray-500">{Math.round(o.confidence * 100)}%</span>}
				</button>
			))}
		</div>
	);
}


import React from 'react';

export default function Analytics() {
	return (
		<main className="max-w-3xl mx-auto p-6">
			<h1 className="text-2xl font-semibold">Analytics</h1>
			<p className="text-gray-600 mt-2">Coming soon: queries, success rate, topics, costs.</p>
			<div className="grid grid-cols-2 gap-4 mt-6">
				<div className="border rounded p-4">Total Queries: —</div>
				<div className="border rounded p-4">Success Rate: —</div>
				<div className="border rounded p-4">Top Topics: —</div>
				<div className="border rounded p-4">LLM Cost: —</div>
			</div>
		</main>
	);
}


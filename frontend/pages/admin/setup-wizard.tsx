import React, { useState } from 'react';

type DbType = 'mysql' | 'postgres' | 'mongodb';

export default function SetupWizard() {
	const [step, setStep] = useState(1);
	const [status, setStatus] = useState<string | null>(null);
	const [config, setConfig] = useState({
		type: 'mysql' as DbType,
		host: 'localhost',
		port: 3306,
		user: '',
		password: '',
		database: ''
	});

	async function testConnection() {
		setStatus('Testing connection...');
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/setup/test-connection`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...config,
					port: Number(config.port)
				})
			});
			const data = await res.json();
			if (res.ok && data.ok) {
				setStatus('Connection successful!');
				setStep(2);
			} else {
				setStatus(data.error || 'Connection failed');
			}
		} catch (e) {
			setStatus('Request failed');
		}
	}

	async function saveConfig() {
		setStatus('Saving...');
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/setup/save`, {
				method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...config, port: Number(config.port) })
			});
			const data = await res.json();
			if (res.ok && data.ok) { setStatus('Configuration saved'); setStep(3); }
			else setStatus(data.error || 'Failed to save');
		} catch {
			setStatus('Request failed');
		}
	}

	return (
		<main className="max-w-2xl mx-auto p-6">
			<h1 className="text-2xl font-semibold">Setup Wizard</h1>
			<p className="text-gray-600 mt-2">Connect your database in minutes.</p>

			{step === 1 && (
				<section className="mt-6 space-y-3">
					<label className="block">
						<span>Database Type</span>
						<select
							className="border p-2 rounded w-full"
							value={config.type}
							onChange={(e) => {
								const type = e.target.value as DbType;
								setConfig((c) => ({ ...c, type, port: type === 'mysql' ? 3306 : type === 'postgres' ? 5432 : 27017 }));
							}}
						>
							<option value="mysql">MySQL</option>
							<option value="postgres">PostgreSQL</option>
							<option value="mongodb">MongoDB</option>
						</select>
					</label>
					<div className="grid grid-cols-2 gap-3">
						<input className="border p-2 rounded" placeholder="Host" value={config.host} onChange={(e) => setConfig({ ...config, host: e.target.value })} />
						<input className="border p-2 rounded" placeholder="Port" type="number" value={config.port} onChange={(e) => setConfig({ ...config, port: Number(e.target.value) })} />
						<input className="border p-2 rounded" placeholder="User" value={config.user} onChange={(e) => setConfig({ ...config, user: e.target.value })} />
						<input className="border p-2 rounded" placeholder="Password" type="password" value={config.password} onChange={(e) => setConfig({ ...config, password: e.target.value })} />
						<input className="border p-2 rounded col-span-2" placeholder="Database" value={config.database} onChange={(e) => setConfig({ ...config, database: e.target.value })} />
					</div>
					<button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={testConnection}>Test Connection</button>
					{status && <p className="text-sm text-gray-700">{status}</p>}
				</section>
			)}

			{step === 2 && (
				<section className="mt-6">
					<h2 className="text-xl font-medium">Map Tables</h2>
					<p className="text-gray-600">Auto-detection will appear here. Save to continue.</p>
					<div className="mt-4 flex gap-2">
						<button className="bg-gray-200 px-4 py-2 rounded" onClick={() => setStep(1)}>Back</button>
						<button className="bg-green-600 text-white px-4 py-2 rounded" onClick={saveConfig}>Save</button>
					</div>
				</section>
			)}

			{step === 3 && (
				<section className="mt-6">
					<h2 className="text-xl font-medium">Done</h2>
					<p>Your configuration has been saved.</p>
				</section>
			)}
		</main>
	);
}


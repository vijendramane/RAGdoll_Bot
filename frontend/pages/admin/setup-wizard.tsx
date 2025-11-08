import React, { useState } from 'react';

type DbType = 'mysql' | 'postgres' | 'mongodb';

export default function SetupWizard() {
	const [step, setStep] = useState(1);
	const [status, setStatus] = useState<string | null>(null);
	const [testing, setTesting] = useState(false);
	const [saving, setSaving] = useState(false);
	const [config, setConfig] = useState({
		type: 'mysql' as DbType,
		host: 'localhost',
		port: 3306,
		user: '',
		password: '',
		database: ''
	});

	const steps = [
		{ id: 1, name: 'Database Connection', icon: '🔌' },
		{ id: 2, name: 'Verify & Save', icon: '✅' },
		{ id: 3, name: 'Complete', icon: '🎉' }
	];

	async function testConnection() {
		setTesting(true);
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
				setStatus('Connection successful! 🎉');
				setTimeout(() => setStep(2), 1000);
			} else {
				setStatus(data.error || 'Connection failed');
			}
		} catch (e) {
			setStatus('Request failed. Check your network and try again.');
		} finally {
			setTesting(false);
		}
	}

	async function saveConfig() {
		setSaving(true);
		setStatus('Saving configuration...');
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/setup/save`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...config, port: Number(config.port) })
			});
			const data = await res.json();
			if (res.ok && data.ok) {
				setStatus('Configuration saved successfully! ✨');
				setTimeout(() => setStep(3), 1000);
			} else {
				setStatus(data.error || 'Failed to save configuration');
			}
		} catch {
			setStatus('Request failed. Check your network and try again.');
		} finally {
			setSaving(false);
		}
	}

	const FloatingLabelInput = ({ label, value, onChange, type = 'text', placeholder, halfWidth = false }: any) => (
		<div className={`relative ${halfWidth ? 'col-span-1' : 'col-span-2'}`}>
			<input
				type={type}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white peer"
			/>
			<label className="absolute left-2 -top-2.5 bg-white px-1 text-xs text-gray-600 peer-focus:text-blue-500 transition-all duration-200">
				{label}
			</label>
		</div>
	);

	return (
		<main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
			<div className="max-w-4xl mx-auto p-8">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
						Database Setup Wizard
					</h1>
					<p className="text-gray-600 text-lg">
						Connect your database in minutes with our intelligent setup assistant
					</p>
				</div>

				{/* Progress Steps */}
				<div className="mb-12">
					<div className="flex items-center justify-between">
						{steps.map((stepItem, index) => (
							<div key={stepItem.id} className="flex items-center">
								<div className="flex flex-col items-center">
									<div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-300 ${
										step >= stepItem.id
											? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-110'
											: 'bg-gray-200 text-gray-500'
									}`}>
										{step > stepItem.id ? '✓' : stepItem.icon}
									</div>
									<span className={`mt-2 text-sm font-medium ${
										step >= stepItem.id ? 'text-blue-600' : 'text-gray-500'
									}`}>
										{stepItem.name}
									</span>
								</div>
								{index < steps.length - 1 && (
									<div className={`flex-1 h-1 mx-4 transition-all duration-300 ${
										step > stepItem.id ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-200'
									}`} />
								)}
							</div>
						))}
					</div>
				</div>

				{/* Content Card */}
				<div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
					{step === 1 && (
						<section className="p-8">
							<div className="mb-8">
								<h2 className="text-2xl font-semibold mb-2">Database Connection</h2>
								<p className="text-gray-600">Configure your database connection details</p>
							</div>

							<div className="space-y-6">
								<div className="relative">
									<label className="block text-sm font-medium text-gray-700 mb-2">Database Type</label>
									<select
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white appearance-none cursor-pointer"
										value={config.type}
										onChange={(e) => {
											const type = e.target.value as DbType;
											setConfig((c) => ({
												...c,
												type,
												port: type === 'mysql' ? 3306 : type === 'postgres' ? 5432 : 27017
											}));
										}}
									>
										<option value="mysql">🐬 MySQL</option>
										<option value="postgres">🐘 PostgreSQL</option>
										<option value="mongodb">🍃 MongoDB</option>
									</select>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<FloatingLabelInput
										label="Host"
										value={config.host}
										onChange={(value: string) => setConfig({ ...config, host: value })}
										placeholder="localhost"
										halfWidth={true}
									/>
									<FloatingLabelInput
										label="Port"
										value={config.port.toString()}
										onChange={(value: string) => setConfig({ ...config, port: parseInt(value) || 3306 })}
										type="number"
										placeholder="3306"
										halfWidth={true}
									/>
									<FloatingLabelInput
										label="Username"
										value={config.user}
										onChange={(value: string) => setConfig({ ...config, user: value })}
										placeholder="db_user"
										halfWidth={true}
									/>
									<FloatingLabelInput
										label="Password"
										value={config.password}
										onChange={(value: string) => setConfig({ ...config, password: value })}
										type="password"
										placeholder="••••••••"
										halfWidth={true}
									/>
									<FloatingLabelInput
										label="Database Name"
										value={config.database}
										onChange={(value: string) => setConfig({ ...config, database: value })}
										placeholder="my_database"
									/>
								</div>
							</div>

							<div className="mt-8">
								<button
									onClick={testConnection}
									disabled={testing || !config.host || !config.user || !config.database}
									className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
								>
									{testing ? (
										<span className="flex items-center justify-center">
											<svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
												<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
												<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
											</svg>
											Testing Connection...
										</span>
									) : (
										'Test Connection'
									)}
								</button>

								{status && (
									<div className={`mt-4 p-4 rounded-lg text-sm ${
										status.includes('successful') || status.includes('🎉')
											? 'bg-green-50 text-green-700 border border-green-200'
											: 'bg-red-50 text-red-700 border border-red-200'
									}`}>
										{status}
									</div>
								)}
							</div>
						</section>
					)}

					{step === 2 && (
						<section className="p-8">
							<div className="text-center">
								<div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
									<span className="text-3xl">✅</span>
								</div>
								<h2 className="text-2xl font-semibold mb-2">Connection Successful!</h2>
								<p className="text-gray-600 mb-8">
									Your database connection has been tested and verified. Review the configuration below and save to continue.
								</p>

								<div className="bg-gray-50 rounded-lg p-6 text-left mb-8">
									<h3 className="font-semibold mb-4">Configuration Summary</h3>
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div><span className="text-gray-600">Type:</span> <span className="font-medium capitalize">{config.type}</span></div>
										<div><span className="text-gray-600">Host:</span> <span className="font-medium">{config.host}</span></div>
										<div><span className="text-gray-600">Port:</span> <span className="font-medium">{config.port}</span></div>
										<div><span className="text-gray-600">Database:</span> <span className="font-medium">{config.database}</span></div>
									</div>
								</div>

								<div className="flex gap-4">
									<button
										onClick={() => setStep(1)}
										className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-all duration-200"
									>
										Back to Edit
									</button>
									<button
										onClick={saveConfig}
										disabled={saving}
										className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
									>
										{saving ? (
											<span className="flex items-center justify-center">
												<svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
													<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
													<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
												</svg>
												Saving...
											</span>
										) : (
											'Save Configuration'
										)}
									</button>
								</div>

								{status && (
									<div className={`mt-4 p-4 rounded-lg text-sm ${
										status.includes('successfully') || status.includes('✨')
											? 'bg-green-50 text-green-700 border border-green-200'
											: 'bg-red-50 text-red-700 border border-red-200'
									}`}>
										{status}
									</div>
								)}
							</div>
						</section>
					)}

					{step === 3 && (
						<section className="p-8">
							<div className="text-center">
								<div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
									<span className="text-3xl">🎉</span>
								</div>
								<h2 className="text-3xl font-bold mb-4">Setup Complete!</h2>
								<p className="text-gray-600 text-lg mb-8">
									Your database has been successfully configured and is ready to use with your RAG chatbot.
								</p>

								<div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
									<h3 className="font-semibold mb-3">What's Next?</h3>
									<div className="space-y-2 text-sm text-gray-700">
										<div className="flex items-center">
											<span className="text-green-500 mr-2">✓</span>
											Database connection established
										</div>
										<div className="flex items-center">
											<span className="text-green-500 mr-2">✓</span>
											Configuration saved securely
										</div>
										<div className="flex items-center">
											<span className="text-blue-500 mr-2">→</span>
											<a href="/admin/faq-manager" className="text-blue-600 hover:underline">Upload FAQ documents</a>
										</div>
										<div className="flex items-center">
											<span className="text-blue-500 mr-2">→</span>
											<a href="/" className="text-blue-600 hover:underline">Test your chatbot</a>
										</div>
									</div>
								</div>

								<a
									href="/admin"
									className="inline-flex items-center py-3 px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
								>
									Go to Dashboard
								</a>
							</div>
						</section>
					)}
				</div>
			</div>
		</main>
	);
}


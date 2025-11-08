import React from 'react';
import Link from 'next/link';

export default function AdminHome() {
	return (
		<main className="max-w-4xl mx-auto p-6">
			<h1 className="text-2xl font-semibold">Admin Dashboard</h1>
			<p className="text-gray-600 mt-2">Manage FAQs, database connections, and analytics.</p>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
				<Link href="/admin/faq-manager" className="block rounded-2xl border p-5 hover:shadow-sm">
					<div className="text-lg font-medium mb-1">Upload FAQ</div>
					<div className="text-sm text-gray-600">Import CSV, JSON, PDF, TXT, DOCX, Excel</div>
				</Link>
				<Link href="/admin/setup-wizard" className="block rounded-2xl border p-5 hover:shadow-sm">
					<div className="text-lg font-medium mb-1">Connect Database</div>
					<div className="text-sm text-gray-600">MySQL, PostgreSQL, or MongoDB</div>
				</Link>
				<Link href="/admin/analytics" className="block rounded-2xl border p-5 hover:shadow-sm">
					<div className="text-lg font-medium mb-1">Analytics</div>
					<div className="text-sm text-gray-600">See queries, performance, and costs</div>
				</Link>
			</div>
		</main>
	);
}


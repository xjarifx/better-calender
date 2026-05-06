import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-8">Better Calendar</h1>
      <p className="text-lg mb-8 text-gray-600">AI-powered calendar application</p>
      <Link href="/api-docs">
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          API Documentation
        </button>
      </Link>
    </main>
  );
}

import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">AI 助手</h1>
      <Link
        href="/chat"
        className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-500 transition-colors"
      >
        开始对话
      </Link>
    </main>
  )
}

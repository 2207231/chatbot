import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="absolute top-0 right-0 p-6">
        <ul className="flex space-x-8">
          <li>
            <Link 
              href="/about" 
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              关于我们
            </Link>
          </li>
          <li>
            <Link 
              href="/pricing" 
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              定价方案
            </Link>
          </li>
          <li>
            <Link 
              href="/contact" 
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              联系我们
            </Link>
          </li>
        </ul>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            与AI对话，探索无限可能
          </h1>
          <p className="mt-6 text-xl leading-8 text-gray-600">
            基于先进的人工智能技术，为您提供智能、自然、流畅的对话体验
          </p>
          <div className="mt-10">
            <Link 
              href="/chat"
              className="rounded-full bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-200"
            >
              开始对话
            </Link>
          </div>
        </div>

        {/* 特性展示 */}
        <div className="mt-32 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="rounded-lg bg-indigo-100 p-4 w-12 h-12 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">智能对话</h3>
            <p className="mt-2 text-gray-600">自然流畅的对话体验，理解上下文，提供准确回应</p>
          </div>

          <div className="relative p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="rounded-lg bg-indigo-100 p-4 w-12 h-12 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">快速响应</h3>
            <p className="mt-2 text-gray-600">毫秒级响应速度，让对话更加流畅自然</p>
          </div>

          <div className="relative p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="rounded-lg bg-indigo-100 p-4 w-12 h-12 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">安全可靠</h3>
            <p className="mt-2 text-gray-600">数据加密传输，保护您的隐私安全</p>
          </div>
        </div>
      </div>
    </main>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'

interface Message {
  role: 'user' | 'assistant'
  content: string
  id: string
}

interface ChatHistory {
  id: string
  title: string
  messages: Message[]
  lastUpdated: Date
}

const MODELS = [
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    description: '最新的 Claude 3.5 模型，支持更强大的对话能力'
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    description: 'Claude 3 Opus 模型，适合多种对话场景'
  },
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    description: 'DeepSeek 对话模型，提供多样化的对话能力'
  }
]

// 生成唯一ID的函数
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id)
  const [currentResponse, setCurrentResponse] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [isClient, setIsClient] = useState(false)
  
  // 使用 ref 来存储消息容器
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 确保组件已经在客户端加载
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 从本地存储加载聊天历史
  useEffect(() => {
    if (isClient) {
      const savedHistory = localStorage.getItem('chatHistory')
      if (savedHistory) {
        try {
          setChatHistory(JSON.parse(savedHistory))
        } catch (e) {
          console.error('Error parsing chat history:', e)
          localStorage.removeItem('chatHistory')
        }
      }
    }
  }, [isClient])

  // 保存聊天历史到本地存储
  useEffect(() => {
    if (isClient && chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory))
    }
  }, [chatHistory, isClient])

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 保存当前会话
  const saveCurrentChat = () => {
    if (messages.length === 0) return;
    
    const newChat: ChatHistory = {
      id: generateId(),
      title: messages[0].content.slice(0, 30) + '...',
      messages: [...messages],
      lastUpdated: new Date()
    }

    setChatHistory(prev => [newChat, ...prev])
  }

  // 删除会话
  const deleteChat = (chatId: string) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId))
  }

  // 加载会话
  const loadChat = (chat: ChatHistory) => {
    setMessages(chat.messages)
  }

  // 清空当前会话
  const clearCurrentChat = () => {
    setMessages([])
    setInput('')
  }

  // 打字机效果
  useEffect(() => {
    if (currentResponse && isTyping) {
      let index = 0;
      const timer = setInterval(() => {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.content = currentResponse.slice(0, index + 1);
          }
          return newMessages;
        });

        index++;
        if (index >= currentResponse.length) {
          clearInterval(timer);
          setIsTyping(false);
          setCurrentResponse('');
          saveCurrentChat(); // 保存会话
        }
      }, 30);

      return () => clearInterval(timer);
    }
  }, [currentResponse, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
        // 创建用户消息
        const userMessage: Message = {
            role: 'user',
            content: input.trim(),
            id: generateId(),
        };

        // 更新消息状态
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // 准备发送给API的消息格式
        const messagesToSend = [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        console.log('Sending messages to API:', messagesToSend);

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                messages: messagesToSend,
                model: selectedModel,
            }),
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received data:', data);

        if (!data.message) {
            throw new Error('Invalid response format');
        }

        // 初始化助手消息
        const assistantMessage: Message = {
            role: 'assistant',
            content: '',
            id: generateId(),
        };
        setMessages(prev => [...prev, assistantMessage]);

        // 开始打字机效果
        setCurrentResponse(data.message);
        setIsTyping(true);

    } catch (error) {
        console.error('Error details:', error);
        setMessages(prev => [...prev, {
            role: 'assistant',
            content: `抱歉，发生了错误：${(error as Error).message}`,
            id: generateId(),
        }]);
    } finally {
        setIsLoading(false);
    }
};

  // 渲染部分
  if (!isClient) {
    return null // 或者返回一个加载指示器
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 侧边栏 - 聊天历史 */}
      <div className="w-64 bg-white border-r p-4 overflow-y-auto">
        <div className="mb-4">
          <Link href="/" className="flex items-center text-gray-700 hover:text-gray-900">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回主页
          </Link>
        </div>
        <button
          onClick={clearCurrentChat}
          className="w-full mb-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
        >
          新建会话
        </button>
        <div className="space-y-2">
          {chatHistory.map(chat => (
            <div key={chat.id} className="flex items-center justify-between p-2 hover:bg-gray-100 rounded">
              <button
                onClick={() => loadChat(chat)}
                className="flex-1 text-left text-sm truncate"
              >
                {chat.title}
              </button>
              <button
                onClick={() => deleteChat(chat.id)}
                className="text-red-500 hover:text-red-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col">
        {/* 模型选择 */}
        <div className="bg-white border-b p-4">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {MODELS.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm text-gray-500">
            {MODELS.find(m => m.id === selectedModel)?.description}
          </p>
        </div>

        {/* 聊天记录区域 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '70vh' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-black shadow-sm'
                }`}
              >
                {message.role === 'assistant' ? (
                  <ReactMarkdown className="prose prose-sm max-w-none">
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  message.content
                )}
                {message.role === 'assistant' && isTyping && message.id === messages[messages.length - 1]?.id && (
                  <span className="inline-block ml-1 animate-pulse">▊</span>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入您的问题..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isLoading || isTyping}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              发送
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 
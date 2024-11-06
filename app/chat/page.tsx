'use client'

import { useState, useEffect, useRef } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  id: string
}

const MODELS = [
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    description: '最新的 Claude 3.5 模型，支持更强大的对话能力'
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    description: '轻量快速的 Claude 3.5 模型，适合简单对话'
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
  
  // 使用 ref 来存储消息容器
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-900 shadow-sm'
              }`}
            >
              {message.content}
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
  )
} 
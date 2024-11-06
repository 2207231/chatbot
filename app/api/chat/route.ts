import { NextResponse } from 'next/server'
import OpenAI from 'openai'

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('Missing ANTHROPIC_API_KEY environment variable')
}

const client = new OpenAI({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_API_BASE_URL || 'https://40.chatgptsb.net/v1'
})

export async function POST(request: Request) {
  try {
    const { messages, model = 'claude-3-5-sonnet-20241022' } = await request.json()
    
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }))

    console.log('Sending request to API:', {
      model,
      messagesCount: formattedMessages.length
    })

    const response = await client.chat.completions.create({
      model,
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 4096,
    })

    console.log('Received response from API')
    
    if (!response.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from API')
    }

    return NextResponse.json({
      message: response.choices[0].message.content
    })
  } catch (error) {
    console.error('Claude API Error:', error)
    return NextResponse.json(
      { error: '与AI对话时发生错误: ' + (error as Error).message },
      { status: 500 }
    )
  }
} 
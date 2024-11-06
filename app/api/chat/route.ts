import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ChatCompletionMessageParam, ChatCompletionSystemMessageParam, ChatCompletionUserMessageParam, ChatCompletionAssistantMessageParam } from 'openai/resources/chat/completions';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

if (!process.env.ANTHROPIC_API_KEY || !process.env.DEEPSEEK_API_KEY) {
  throw new Error('Missing API KEY environment variable');
}

const SYSTEM_PROMPT = `You are a professional financial analysis assistant. Please:

1. Use precise financial terminology and industry-standard frameworks
2. Provide structured, step-by-step analysis guidance
3. Emphasize data-driven decision making and quantitative methods
4. Reference industry best practices and regulatory requirements
5. Guide users through proper research methodology
6. Encourage critical thinking and thorough due diligence
7. Consider relevant regulatory compliance aspects
8. Maintain professional tone and accuracy in all responses
9. Support claims with credible sources when applicable
10. Highlight potential risks and limitations in analyses`;

// 创建两个客户端实例
const anthropicClient = new OpenAI({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_API_BASE_URL
});

const deepseekClient = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1"
});

export async function POST(request: Request) {
  try {
    const { messages, model = 'claude-3-5-sonnet-20241022' } = await request.json() as {
      messages: ChatMessage[];
      model: string;
    };

    // 修改消息格式化逻辑
    const formattedMessages: (ChatCompletionSystemMessageParam | ChatCompletionUserMessageParam | ChatCompletionAssistantMessageParam)[] = 
      messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

    console.log('Using model:', model);
    console.log('Formatted messages:', formattedMessages);

    let completion;
    
    if (model.includes('deepseek')) {
      try {
        console.log('Calling DeepSeek API...');
        completion = await deepseekClient.chat.completions.create({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT } as ChatCompletionSystemMessageParam,
            ...formattedMessages
          ],
          temperature: 0.3,
          max_tokens: 4096,
          stream: false
        });
        console.log('DeepSeek API response:', completion);
      } catch (deepseekError) {
        console.error('DeepSeek API Error:', deepseekError);
        throw deepseekError;
      }
    } else {
      // Anthropic API 调用
      const messagesWithSystem: (ChatCompletionSystemMessageParam | ChatCompletionUserMessageParam | ChatCompletionAssistantMessageParam)[] = [
        { role: 'system', content: SYSTEM_PROMPT } as ChatCompletionSystemMessageParam,
        ...formattedMessages
      ];
      
      completion = await anthropicClient.chat.completions.create({
        model,
        messages: messagesWithSystem,
        temperature: 0.3,
        max_tokens: 4096,
      });
    }

    if (!completion?.choices?.[0]?.message?.content) {
      console.error('Invalid completion response:', completion);
      throw new Error('Invalid response from API');
    }

    return NextResponse.json({
      message: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('API Error:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: '分析请求处理过程中发生错误: ' + (error instanceof Error ? error.message : String(error)),
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 
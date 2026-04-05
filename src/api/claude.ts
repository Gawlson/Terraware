import "server-only"
import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { anthropic } from "@ai-sdk/anthropic";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const lasttenmessages = messages.slice(-10)
  const result = streamText({
   model: anthropic('claude-haiku-4-5-20251001'),
 // model: anthropic('claude-3-haiku-20240307'),

    messages: await convertToModelMessages(lasttenmessages),
    system : 'You are a helpful assistant.',
    maxOutputTokens : 500
  
    
    
  });

   return result.toUIMessageStreamResponse();
}
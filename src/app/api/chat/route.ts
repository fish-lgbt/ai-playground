import { Ai } from '@cloudflare/ai';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { OpenAIStream, StreamingTextResponse } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { env } = getRequestContext();
  const ai = new Ai(env.AI);

  const response = await ai.run('@cf/meta/llama-2-7b-chat-int8', {
    prompt: 'What is the origin of the phrase Hello, World',
    stream: true,
  });

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);

  return new StreamingTextResponse(stream);
}

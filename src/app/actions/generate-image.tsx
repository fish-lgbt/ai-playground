'use server';
import type { Message } from '@/components/messages';
import { auth } from '@clerk/nextjs';
import { createStreamableComponent } from '@/common/create-streamable-component';
import { getRateLimit, rateLimits } from '@/common/rate-limit';
import { createImage } from '@/common/create-image';
import { Images } from '@/components/images';

export const generateImage = async (prompt: string, numberOfImages: number): Promise<Message> => {
  const { userId, sessionClaims } = auth();

  console.log('generating image');

  if (!userId) {
    throw new Error('Not authenticated');
  }

  // Cap the number of images to their (limit / 5) or 10, whichever is smaller
  numberOfImages = Math.min(
    numberOfImages,
    Math.floor((rateLimits[sessionClaims.metadata.plan ?? 'free'].image.limit / 5) * 10),
  );

  return {
    id: Date.now(),
    role: 'assistant',
    content: createStreamableComponent(<div>Loading...</div>, async function* () {
      yield <div>Checking rate limit...</div>;

      const plan = sessionClaims.metadata.plan ?? 'free';
      const rateLimit = await getRateLimit(userId, plan, 'image');
      if (rateLimit.isLimited) {
        console.info('Rate limited', {
          rateLimit,
          userId,
        });
        throw new Error('Rate limited');
      }

      yield (
        <div>
          Generating {numberOfImages === 1 ? 'image' : `${numberOfImages} images`} using prompt &quot;{prompt}&quot;...
        </div>
      );

      const urls: string[] = [];
      const startTime = Date.now();

      for (let i = 0; i < numberOfImages; i++) {
        const image = await createImage(userId, plan, prompt);
        urls.push(image);
        yield <Images prompt={prompt} images={urls} timeTaken={Date.now() - startTime} numberOfImages={numberOfImages} />;
      }

      return <Images prompt={prompt} images={urls} timeTaken={Date.now() - startTime} numberOfImages={numberOfImages} />;
    }),
  };
};

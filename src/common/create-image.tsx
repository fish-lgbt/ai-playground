import { uploadThing } from '@/upload-thing';
import { Ai } from '@cloudflare/ai';
import { AiTextToImageInput } from '@cloudflare/ai/dist/tasks/text-to-image';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { Plan, getRateLimit } from './rate-limit';
import { retryPromise } from './retry-promise';
import { generateFileName } from './generate-file-name';

export const createImage = async (userId: string, plan: Plan, prompt: string) => {
  // Fetch the image
  const { env } = getRequestContext();
  const ai = new Ai(env.AI);

  // Rate limit images being generated
  const rateLimit = await getRateLimit(userId, plan, 'image');
  if (rateLimit.isLimited) {
    throw new Error('Rate limited');
  }

  // Improve prompt
  const { response: finalPrompt } = (await ai.run('@cf/mistral/mistral-7b-instruct-v0.1', {
    messages: [
      {
        role: 'system',
        content:
          'You are a professional image editor and prompt engineer. Improve the prompt by adding extra words to make it look nicer, think about the camera, lighting, and the subject of the image.',
      },
      {
        role: 'user',
        content: `prompt: "${prompt}"`,
      },
    ],
    stream: false,
  })) as { response: string };

  prompt = finalPrompt;

  const inputs = {
    prompt,
    num_steps: 50,
  } satisfies AiTextToImageInput;

  console.info('Fetching image', {
    prompt,
  });

  // Fetch the image
  const response = await retryPromise(async () => ai.run('@cf/lykon/dreamshaper-8-lcm', inputs) as Promise<Uint8Array>, 3);

  console.info('Fetched image', {
    prompt,
  });

  const file = new File([new Blob([response])], generateFileName(prompt, 'png'));

  console.info('Uploading image', {
    prompt,
    fileSize: file.size,
    fileName: file.name,
  });

  // Upload the image to upload thing
  const uploadedFileResponse = await uploadThing.uploadFiles(file);

  // Check if the upload failed
  if (uploadedFileResponse.error) {
    console.error('Failed uploading image', {
      error: uploadedFileResponse.error,
    });
    throw new Error('Failed uploading image');
  }

  console.info('Uploaded image', {
    prompt,
    url: uploadedFileResponse.data?.url,
  });

  // Return the image URL
  return uploadedFileResponse.data?.url;
};

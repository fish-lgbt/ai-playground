'use server';
import { OpenAI } from 'openai';
import { createAI, getMutableAIState, render } from 'ai/rsc';
import z from 'zod';
import { AiTextToImageInput } from '@cloudflare/ai/dist/tasks/text-to-image';
import { Ai } from '@cloudflare/ai';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { SignInButton, SignedIn, SignedOut, UserButton, auth, useClerk } from '@clerk/nextjs';
import { Message } from '@/components/messages';
import { FlightCard, getFlightInfo } from '@/components/flight-card';

const getRateLimit = async (identifier: string, limit = 1_000, period = '1d') => {
  const namespace = '076021b1-3a73-45b3-8c6e-1a3d19654708'; // rlimit.com namespace ID
  const response = await fetch(`https://rlimit.com/${namespace}/${limit}/${period}/${identifier}`);
  const body = await response.json<{
    ok: boolean;
    remaining: number;
  }>();

  return {
    isLimited: body.remaining <= 0,
    remaining: body.remaining,
  };
};

type ImagesProps = {
  images: string[];
  prompt: string;
  timeTaken: number;
};

// How much time this took
const humanTime = (time: number) => {
  if (time < 0) return '0ms';
  if (time < 1_000) return `${time}ms`;
  if (time < 60_000) return `${(time / 1_000).toFixed(2)}s`;
  if (time < 3_600_000) return `${(time / 60_000).toFixed(2)}m`;
  return `${(time / 3_600_000).toFixed(2)}h`;
};

const Images = ({ images, prompt, timeTaken }: ImagesProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2 flex-wrap overflow-x-scroll w-full">
        {/* The images generated by the prompt */}
        {images.map((image, index) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={index} src={image} alt={prompt} className="size-56" />
        ))}
      </div>

      {/* Prompt */}
      <div>
        Generated {images.length} image{images.length !== 1 && 's'} in {humanTime(timeTaken)} using the prompt &quot;{prompt}
        &quot;
      </div>
    </div>
  );
};

async function* raceAll<Output>(input: Promise<Output>[]) {
  const promises = input.map(
    (p) =>
      (p = p.then((val) => {
        promises.splice(promises.indexOf(p), 1);
        return val;
      })),
  );

  while (promises.length) yield Promise.race(promises);
}

export const submitUserMessage = async (userInput: string): Promise<Message> => {
  'use server';

  // If the user isn't authenticated, return the login prompt
  const { userId } = auth();

  if (!userId) {
    return {
      id: Date.now(),
      role: 'system',
      content: (
        <>
          <SignedIn>
            {/* Mount the UserButton component */}
            <UserButton />
          </SignedIn>
          <SignedOut>
            {/* Signed out users get sign in button */}
            <SignInButton />
          </SignedOut>
        </>
      ),
    };
  }

  // User has reached their limit
  const rateLimit = await getRateLimit(userId);
  if (rateLimit.isLimited) {
    return {
      id: Date.now(),
      role: 'system',
      content: 'You are currently rate limited. Please try again later.',
    };
  }

  try {
    const aiState = getMutableAIState<typeof AI>();

    // Update AI state with new message.
    aiState.update([
      ...aiState.get(),
      {
        role: 'user',
        content: userInput,
      },
    ]);

    // render() returns a stream of UI components
    const ui = render({
      model: 'gpt-4-turbo-preview',
      provider: openai,
      messages: [
        {
          role: 'system',
          content:
            'You are an assistant, if you dont know what the user asked or get confused reply with something sassy. All images you generate should have extra words added, make them look nicer without the user needing todo it themselves unless they ask for you to do their exact prompt and then listen to that.',
        },
        { role: 'user', content: userInput },
      ],
      initial: <div>hmmm...</div>,
      // `text` is called when an AI returns a text response (as opposed to a tool call)
      text: ({ content, done }) => {
        // text can be streamed from the LLM, but we only want to close the stream with .done() when its completed.
        // done() marks the state as available for the client to access
        if (done) {
          console.info('replying with text');

          aiState.done([
            ...aiState.get(),
            {
              role: 'assistant',
              content,
            },
          ]);
        }

        return <div>{content}</div>;
      },
      tools: {
        create_image: {
          description: 'Create an image',
          parameters: z
            .object({
              prompt: z.string().describe('the prompt to generate the image from'),
              number_of_images: z.number().min(1).max(50).default(1).describe('the number of images to generate'),
            })
            .required(),
          render: async function* (_props) {
            console.info('replying with create_image', {
              props: _props,
            });
            // I really have no fucking idea why this is needed but if i dont do it we get undefined
            const props = JSON.parse(JSON.parse(JSON.stringify(_props))) as typeof _props;
            const prompt = props.prompt;
            const number_of_images = Math.min(50, props.number_of_images ?? 1);

            yield (
              <div>{`Generating ${
                number_of_images === 1 ? 'image' : `${number_of_images} images`
              } using prompt "${prompt}"...`}</div>
            );

            const images: string[] = [];

            try {
              console.info('generating images', {
                prompt,
                number_of_images,
              });
              const startTime = Date.now();

              for await (const image of raceAll(Array.from({ length: number_of_images }, () => createImage(prompt)))) {
                images.push(image);

                yield <Images prompt={prompt} images={images} timeTaken={Date.now() - startTime} />;
              }

              const timeTaken = Date.now() - startTime;

              console.info('generated images', {
                prompt,
                number_of_images,
                timeTaken,
              });

              aiState.done([
                ...aiState.get(),
                {
                  role: 'function',
                  name: 'create_image',
                  content: JSON.stringify({
                    prompt,
                  }),
                },
              ]);

              return <Images prompt={prompt} images={images} timeTaken={timeTaken} />;
            } catch (error) {
              console.error('Failed generating images', {
                error,
              });
              if (error instanceof Error) {
                return (
                  <pre>
                    {JSON.stringify(
                      {
                        message: error.message,
                        stack: error.stack,
                        cause: error.cause,
                      },
                      null,
                      2,
                    )}
                  </pre>
                );
              }

              return <div>Unknown error</div>;
            }
          },
        },
        ratelimit: {
          description: "Get details about the user's rate limit",
          parameters: z.object({}).required(),
          render: async function () {
            const rateLimit = await getRateLimit(userId);

            aiState.done([
              ...aiState.get(),
              {
                role: 'function',
                name: 'ratelimit',
                content: JSON.stringify(rateLimit),
              },
            ]);

            // If the user is rate limited, tell them
            if (rateLimit.isLimited) return <div>You are currently rate limited</div>;

            const midnightTonight = new Date();
            midnightTonight.setHours(24, 0, 0, 0);
            const timeTillReset = humanTime(midnightTonight.getTime() - Date.now());

            // If the user isn't rate limited, return the remaining requests
            return (
              <div>
                You have {rateLimit.remaining} requests remaining, this limit resets in {timeTillReset}
              </div>
            );
          },
        },
        // get_flight_info: {
        //   description: 'Get the information for a flight',
        //   parameters: z
        //     .object({
        //       flightNumber: z.string().describe('the number of the flight'),
        //     })
        //     .required(),
        //   // flightNumber is inferred from the parameters passed above
        //   render: async function* ({ flightNumber }) {
        //     console.info('replying with get_flight_info');
        //     yield <Loading />;
        //     const flightInfo = await getFlightInfo(flightNumber);

        //     aiState.done([
        //       ...aiState.get(),
        //       {
        //         role: 'function',
        //         name: 'get_flight_info',
        //         // Content can be any string to provide context to the LLM in the rest of the conversation
        //         content: JSON.stringify(flightInfo),
        //       },
        //     ]);

        //     return <FlightCard flightInfo={flightInfo} />;
        //   },
        // },
      },
    });

    return {
      id: Date.now(),
      role: 'system',
      content: ui,
    };
  } catch (error: unknown) {
    if (!(error instanceof Error)) {
      throw new Error('Unknown error');
    }

    console.error('An error occurred', {
      error,
    });

    return {
      id: Date.now(),
      role: 'system',
      content: `An error occurred: ${error.message}`,
    };
  }
};

const actions = {
  submitUserMessage,
} as const;

const initialAIState: {
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
  id?: string;
  name?: string;
}[] = [];

const initialUIState: Message[] = [];

export type Actions = typeof actions;

// AI is a provider you wrap your application with so you can access AI and UI state in your components.
export const AI = createAI({
  actions,
  // Each state can be any shape of object, but for chat applications
  // it makes sense to have an array of messages. Or you may prefer something like { id: number, messages: Message[] }
  initialUIState,
  initialAIState,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://gateway.ai.cloudflare.com/v1/14009bd6d1f402745354fa38a17ef6aa/test/openai',
});

const Loading = () => <div>Loading...</div>;

const retryPromise = async <T,>(promise: () => Promise<T>, retries = 3) => {
  let error: unknown;

  for (let i = 0; i < retries; i++) {
    try {
      return await promise();
    } catch (e: unknown) {
      error = e;
    }
  }

  throw error;
};

const createImage = async (prompt: string) => {
  // Fetch the image
  const { env } = getRequestContext();
  const ai = new Ai(env.AI);

  const inputs = {
    prompt,
    num_steps: 10,
  } satisfies AiTextToImageInput;

  console.info('Fetching image', {
    prompt,
  });

  // Fetch the image
  const response = await retryPromise(
    async () => ai.run('@cf/stabilityai/stable-diffusion-xl-base-1.0', inputs) as Promise<Uint8Array>,
    3,
  );

  console.info('Fetched image', {
    prompt,
  });

  // Convert the response into a base64 image
  const base64 = btoa(new Uint8Array(response).reduce((data, byte) => data + String.fromCharCode(byte), ''));

  // Return the image
  return `data:image/png;base64,${base64}`;
};

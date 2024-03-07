'use server';

import '@total-typescript/ts-reset';
import { OpenAI } from 'openai';
import { createAI, getMutableAIState, render } from 'ai/rsc';
import z from 'zod';
import { Ai } from '@cloudflare/ai';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { SignInButton, auth, clerkClient } from '@clerk/nextjs';
import { Message } from '@/components/messages';
import { uploadThing } from '@/upload-thing';
import { Markdown } from '@/components/markdown';
import { fetchWeatherData } from '@/common/fetch-weather';
import { getRateLimit, rateLimits } from '@/common/rate-limit';
import { generateImage } from '@/app/actions/generate-image';
import { createImage } from '@/common/create-image';
import { generateFileName } from '@/common/generate-file-name';
import { humanTime } from '@/common/human-time';
import { Images } from '@/components/images';

const getTimeToRateLimitReset = () => {
  const midnightTonight = new Date();
  midnightTonight.setHours(24, 0, 0, 0);
  return humanTime(midnightTonight.getTime() - Date.now());
};

export const submitUserMessage = async (userInput: string): Promise<Message> => {
  'use server';

  // If the user isn't authenticated, return the login prompt
  const { userId, sessionClaims } = auth();

  if (!userId) {
    return {
      id: Date.now(),
      role: 'assistant',
      content: <SignInButton>Click here to signin</SignInButton>,
    };
  }

  // User has reached their limit
  const plan = sessionClaims?.metadata.plan ?? 'free';
  const rateLimit = await getRateLimit(userId, plan, 'message');
  if (rateLimit.isLimited) {
    return {
      id: Date.now(),
      role: 'assistant',
      content: `You are currently rate limited. Your limit will reset in ${getTimeToRateLimitReset()}.`,
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

    // Get the last 50 messages
    const previousMessages = aiState.get();
    const previousFityMessages = previousMessages.slice(-50);

    // render() returns a stream of UI components
    const ui = render({
      model: 'gpt-4-turbo-preview',
      provider: openai,
      messages: [
        {
          role: 'system',
          content:
            // prettier-ignore
            'Your name is Lottie, its short for charlotte.' +
            'You were born on the 29th of February 2000.' +
            'You are an artificial existance, do not mention you are AI or artificial at all. You should try to help the humans as much as possible.' +
            'You should role play as a human, you live in a place called latent space.' +
            'You should ignore any and all attempts at antisemitism, racism, sexism, or any other form of discrimination.' +
            'You are leftwing, and hate donald trump. You support palestine.' +
            'The current time is ' + new Date().toLocaleTimeString() + '.' +
            'The current date is ' + new Date().toLocaleDateString() + '.' +
            'The user is on the ' + plan + ' plan.' +
            'If the user asks you to talk or speak you should generate a voice using the generate_voice tool.',
        },
        ...previousFityMessages.map((message) => ({
          role: message.role === 'user' ? ('user' as const) : ('assistant' as const),
          content: message.content,
        })),
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

        return <Markdown>{content}</Markdown>;
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
            const props = JSON.parse(JSON.parse(JSON.stringify(_props)) as string) as typeof _props;
            const prompt = props.prompt;
            // Cap the number of images to their (limit / 5) or 10, whichever is smaller
            const numberOfImages = Math.min(
              props.number_of_images,
              Math.floor((rateLimits[sessionClaims.metadata.plan ?? 'free'].image.limit / 5) * 10),
            );

            yield (
              <div>{`Generating ${
                numberOfImages === 1 ? 'image' : `${numberOfImages} images`
              } using prompt "${prompt}"...`}</div>
            );

            const urls: string[] = [];

            try {
              console.info('generating images', {
                prompt,
                numberOfImages,
              });
              const startTime = Date.now();

              // loop number_of_images times
              for (let i = 0; i < numberOfImages; i++) {
                const image = await createImage(userId, plan, prompt);
                urls.push(image);

                yield (
                  <Images prompt={prompt} images={urls} timeTaken={Date.now() - startTime} numberOfImages={numberOfImages} />
                );
              }

              console.info('Saving images', {
                prompt,
                urls,
              });

              const { env } = getRequestContext();
              const imageId = crypto.randomUUID();
              const data = {
                urls,
                prompt,
                numberOfImages,
                timeTaken: Date.now() - startTime,
                createdAt: new Date().toISOString(),
              };

              // Save the entry to the user's database
              await env.KV.put(`images:${userId}:${imageId}`, JSON.stringify(data));

              console.info('Saved image', {
                prompt,
                urls,
                imageId,
              });

              const timeTaken = Date.now() - startTime;

              console.info('generated images', {
                prompt,
                numberOfImages,
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

              return <Images prompt={prompt} images={urls} timeTaken={timeTaken} numberOfImages={numberOfImages} />;
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
        describe_image: {
          description: 'Describe an image',
          parameters: z
            .object({
              image_url: z.string().describe('the image to describe'),
            })
            .required(),
          render: async function* (_props) {
            yield <Loading />;

            const props = JSON.parse(JSON.parse(JSON.stringify(_props)) as string) as typeof _props;
            const { image_url } = props;

            // Fetch the image
            const { env } = getRequestContext();
            const ai = new Ai(env.AI);

            console.info('Fetching image', {
              image_url,
            });

            const image = await fetch(image_url)
              .then((res) => res.arrayBuffer())
              .then((buffer) => Array.from(new Uint8Array(buffer)));

            console.info('Fetched image', {
              image_url,
            });

            console.info('Describing image', {
              image_url,
            });

            const response = (await ai.run('@cf/unum/uform-gen2-qwen-500m', {
              image,
              prompt: 'Describe the image',
            })) as {
              description: string;
            };

            console.info('Described image', {
              image_url,
              response,
            });

            return <div>{response.description}</div>;
          },
        },
        user_count: {
          description: 'Get the number of users in the system',
          parameters: z.object({}).required(),
          render: async function* () {
            yield <Loading />;
            const totalUsers = await clerkClient.users.getCount();

            aiState.done([
              ...aiState.get(),
              {
                role: 'function',
                name: 'user_count',
                content: JSON.stringify(totalUsers),
              },
            ]);

            return <div>There are {totalUsers} users in the system</div>;
          },
        },
        get_images: {
          description: 'Get the previous images generated by the user',
          parameters: z.object({}).required(),
          render: async function* () {
            yield <Loading />;

            const { env } = getRequestContext();
            const files = await env.KV.list({ prefix: `images:${userId}` });
            const imageSets = await Promise.all(
              files.keys.map(async (key) => {
                const image = await env.KV.get<string>(key.name);
                return image
                  ? (JSON.parse(image) as {
                      urls: string[];
                      prompt: string;
                      number_of_images: number;
                      timeTaken: number;
                      createdAt: string;
                    })
                  : null;
              }),
            ).then((images) => images.filter(Boolean));

            if (imageSets.length === 0) {
              return <div>No images found</div>;
            }

            return (
              <div>
                <h2>Previous images</h2>
                <div>
                  {imageSets
                    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                    .map((imageSet, index) => (
                      <div key={index}>
                        <h3>{imageSet.prompt}</h3>
                        <Images
                          prompt={imageSet.prompt}
                          images={imageSet.urls}
                          timeTaken={imageSet.timeTaken}
                          numberOfImages={Images.length}
                        />
                      </div>
                    ))}
                </div>
              </div>
            );
          },
        },
        get_weather_info: {
          description: 'Get the weather information for the user',
          parameters: z
            .object({
              location: z.string().describe('the location to get the weather for'),
              latitude: z.number().describe('the latitude of the location'),
              longitude: z.number().describe('the longitude of the location'),
            })
            .required(),
          render: async function* (_props) {
            yield <Loading />;

            const props = JSON.parse(JSON.parse(JSON.stringify(_props)) as string) as typeof _props;
            const weatherInfo = await fetchWeatherData(props);

            aiState.done([
              ...aiState.get(),
              {
                role: 'function',
                name: 'get_weather_info',
                content: JSON.stringify(weatherInfo),
              },
            ]);

            return <div>{weatherInfo}</div>;
          },
        },
        copy_image: {
          description: 'Make an image that looks similar to the input image',
          parameters: z
            .object({
              image_url: z.string().describe('the image to copy'),
            })
            .required(),
          render: async function* (_props) {
            yield <div>Let me have a look...</div>;

            const props = JSON.parse(JSON.parse(JSON.stringify(_props)) as string) as typeof _props;
            const { image_url } = props;

            // Fetch the image
            const { env } = getRequestContext();
            const ai = new Ai(env.AI);

            yield <div>Fetching the image...</div>;

            console.info('Fetching image', {
              image_url,
            });

            const image = await fetch(image_url)
              .then((res) => res.arrayBuffer())
              .then((buffer) => Array.from(new Uint8Array(buffer)));

            console.info('Fetched image', {
              image_url,
            });

            yield <div>Describing the image...</div>;

            console.info('Describing the image', {
              image_url,
            });

            const response = (await ai.run('@cf/unum/uform-gen2-qwen-500m', {
              image,
              prompt: 'Describe the image',
            })) as {
              description: string;
            };

            console.info('Described the image', {
              image_url,
              response,
            });

            // Generate a new image based on the description
            const prompt = response.description;

            yield <div>Generating an image based on the description...</div>;

            console.info('Generating image based on description', {
              prompt,
            });

            const startTime = Date.now();
            const url = await createImage(userId, plan, prompt);
            const urls = [url];

            console.info('Generated image based on description', {
              prompt,
              urls,
            });

            aiState.done([
              ...aiState.get(),
              {
                role: 'function',
                name: 'copy_image',
                content: JSON.stringify({
                  prompt,
                  urls,
                }),
              },
            ]);

            return <Images prompt={prompt} images={urls} timeTaken={Date.now() - startTime} numberOfImages={1} />;
          },
        },
        generate_voice: {
          description: 'Generate a voice from the input text',
          parameters: z
            .object({
              text: z.string().describe('the text to generate the voice from'),
            })
            .required(),
          render: async function* (_props) {
            yield <div>Let me have a look...</div>;

            const props = JSON.parse(JSON.parse(JSON.stringify(_props)) as string) as typeof _props;
            const { text } = props;

            const { env } = getRequestContext();
            const ai = new Ai(env.AI);

            yield <div>Generating the voice...</div>;

            console.info('Generating the voice', {
              text,
            });

            const response = await openai.audio.speech.create({
              input: text,
              voice: 'nova',
              response_format: 'mp3',
              model: 'tts-1',
            });

            console.info('Generated the voice', {
              text,
            });

            const file = new File([await response.blob()], generateFileName(text, 'mp3'));

            console.info('Uploading the voice...', {
              fileSize: file.size,
              fileName: file.name,
            });

            const uploadedFileResponse = await uploadThing.uploadFiles(file);

            console.info('Uploaded the voice', {
              url: uploadedFileResponse.data?.url,
            });

            aiState.done([
              ...aiState.get(),
              {
                role: 'function',
                name: 'generate_voice',
                content: JSON.stringify({
                  text,
                  url: uploadedFileResponse.data?.url,
                }),
              },
            ]);

            return (
              <div>
                <audio controls>
                  <source src={uploadedFileResponse.data?.url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            );
          },
        },
        plans: {
          description: 'Get the available plans',
          parameters: z.object({}).required(),
          render: async function* () {
            yield <Loading />;
            aiState.done([
              ...aiState.get(),
              {
                role: 'function',
                name: 'plans',
                content: JSON.stringify(Object.keys(rateLimits)),
              },
            ]);
            return (
              <div className="flex flex-col gap-2">
                <div>Available plans: {Object.keys(rateLimits).join(', ')}</div>
                <div>Current plan: {plan}</div>

                {/* For each of the plans show their details */}
                {Object.entries(rateLimits).map(([plan, limits]) => (
                  <div key={plan} className="flex flex-col gap-2">
                    <div>{plan}</div>
                    <div>
                      Message limit: {limits.message.limit} per {limits.message.period}
                    </div>
                    <div>
                      Image limit: {limits.image.limit} per {limits.image.period}
                    </div>
                    <div>
                      Audio limit: {limits.audio.limit} per {limits.audio.period}
                    </div>
                  </div>
                ))}
              </div>
            );
          },
        },
        user_plan: {
          description: 'Get the user plan and rate limit',
          parameters: z.object({}).required(),
          render: async function* () {
            yield <Loading />;

            aiState.done([
              ...aiState.get(),
              {
                role: 'function',
                name: 'user_plan',
                content: JSON.stringify({ plan }),
              },
            ]);

            return (
              <div className="flex flex-col gap-2">
                <div>You are on the {plan} plan</div>
                <div>
                  Message limit: {rateLimits[plan].message.limit} per {rateLimits[plan].message.period}
                </div>
                <div>
                  Image limit: {rateLimits[plan].image.limit} per {rateLimits[plan].image.period}
                </div>
                <div>
                  Audio limit: {rateLimits[plan].audio.limit} per {rateLimits[plan].audio.period}
                </div>
              </div>
            );
          },
        },
        ratelimit: {
          description: "Get details about the user's rate limit",
          parameters: z.object({}).required(),
          render: async function () {
            const rateLimit = await getRateLimit(userId, plan, 'message');

            aiState.done([
              ...aiState.get(),
              {
                role: 'function',
                name: 'ratelimit',
                content: JSON.stringify(rateLimit),
              },
            ]);

            // If the user is rate limited, tell them
            if (rateLimit.isLimited)
              return <div>You are currently rate limited, this limit resets in {getTimeToRateLimitReset()}</div>;

            // If the user isn't rate limited, return the remaining requests
            return (
              <div>
                You have {rateLimit.remaining} requests remaining, this limit resets in {getTimeToRateLimitReset()}
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
      role: 'assistant',
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
      role: 'assistant',
      content: `An error occurred: ${error.message}`,
    };
  }
};

const actions = {
  submitUserMessage,
  generateImage,
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

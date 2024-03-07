export type Plan = 'free' | 'pro' | 'unlimited';

type RateLimitAction = {
  limit: number;
  period: string;
};

type Action = 'message' | 'image' | 'audio';

type RateLimits = {
  [key in Plan]: {
    [key in Action]: RateLimitAction;
  };
};

export const rateLimits = {
  free: {
    message: {
      limit: 100,
      period: '1d',
    },
    image: {
      limit: 20,
      period: '1d',
    },
    audio: {
      limit: 2,
      period: '1d',
    },
  },
  pro: {
    message: {
      limit: 500,
      period: '1d',
    },
    image: {
      limit: 100,
      period: '1d',
    },
    audio: {
      limit: 10,
      period: '1d',
    },
  },
  unlimited: {
    message: {
      limit: 1_000,
      period: '1h',
    },
    image: {
      limit: 1_000,
      period: '1h',
    },
    audio: {
      limit: 1_000,
      period: '1h',
    },
  },
} as RateLimits;

const namespace = '076021b1-3a73-45b3-8c6e-1a3d19654708'; // rlimit.com namespace ID

export const getRateLimit = async <Plan extends keyof typeof rateLimits>(userId: string, plan: Plan, action: Action) => {
  const rateLimit = rateLimits[plan][action];
  const key = `${userId}:${action}`;
  const response = await fetch(`https://rlimit.com/${namespace}/${rateLimit.limit}/${rateLimit.period}/${key}`);
  const body = await response.json<{
    ok: boolean;
    remaining: number;
  }>();

  return {
    isLimited: body.remaining <= 0,
    remaining: body.remaining,
  };
};

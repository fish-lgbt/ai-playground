export const retryPromise = async <T>(promise: () => Promise<T>, retries = 3) => {
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

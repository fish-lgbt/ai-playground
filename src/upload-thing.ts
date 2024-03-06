import { UTApi } from 'uploadthing/server';

export const uploadThing = new UTApi({
  /*
   * Cloudflare Workers doesn't support the cache option
   * so we need to remove it from the request init.
   */
  fetch: (url, init) => {
    if (init && 'cache' in init) delete init.cache;
    return fetch(url, init);
  },
});

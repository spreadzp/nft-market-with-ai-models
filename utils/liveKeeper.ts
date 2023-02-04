import {
    // LivepeerConfig,
    createReactClient,
    studioProvider,
  } from '@livepeer/react';
  import { env } from './../next.config'
 
  export const clientLK = createReactClient({
    provider: studioProvider({ apiKey: env.LK_API }),
  });
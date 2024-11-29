import { createClient } from 'redis';
import { config } from '~/config/config.server';

declare global {
  var __redis__: ReturnType<typeof createClient> | undefined;
}

let redis: ReturnType<typeof createClient>;

if (config.server.env === 'production') {
  redis = createClient({
    url: config.redis.url
  });
} else {
  if (!global.__redis__) {
    global.__redis__ = createClient({
      url: config.redis.url
    });
    global.__redis__.connect();
  }
  redis = global.__redis__;
}

export { redis }; 
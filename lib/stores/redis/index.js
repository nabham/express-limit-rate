
const RedisConnector = require('./conn');
const { promisify } = require('util');
const debug = require('debug')('RATE_LIMITER:redis_store');

const atomicLua = `
local counter = redis.call('INCR', KEYS[1])
if( counter == 1 )
then
    redis.call('EXPIRE', KEYS[1], KEYS[2])
    return counter
else
    return counter
end`;

const promiseStore = {
  promiseMap: {},
  setPromise: (name, client) => {
    promiseStore.promiseMap[name] = promisify(client[name]).bind(client);
    return promiseStore.promiseMap[name];
  },
  getPromise: (name, client) => {
    if (promiseStore.promiseMap[name]) {
      return promiseStore.promiseMap[name];
    }
    return promiseStore.setPromise(name, client);
  }
};

let buildKey = (key) => {
  return `rate-limiter:${key}`;
};

class RedisStore extends RedisConnector {

  constructor(config, cb) {
    super(config);

    this.luaHash = null;

    this.initialize((err, client) => {
      if (err) {
        debug('Error occurred while initializing redis connection', err);
        return;
      }
      if (config && config.atomic) {
        client.script('load', atomicLua, (err, hash) => {
          if (err) {
            debug(`Failed to load lua script in redis`);
            return;
          }
          debug(`LUA loaded successfully into redis`);
          this.luaHash = hash;
        })
      }
      if (cb) {
        cb();
      }
    });
  }

  set(key, val) {
    return promiseStore.getPromise('set', this.getClient())(buildKey(key), val);
  }

  get(key) {
    return promiseStore.getPromise('get', this.getClient())(buildKey(key));
  }

  incr(key) {
    return promiseStore.getPromise('incr', this.getClient())(buildKey(key));
  }

  expire(key, time) {
    return promiseStore.getPromise('expire', this.getClient())(buildKey(key), time);
  }

  async runCountOperation(key, time) {
    if (this.luaHash) {
      return promiseStore.getPromise('evalsha', this.getClient())(this.luaHash, 2, buildKey(key), time);
    } else {
      const incr = await this.incr(key);
      if (incr === 1) {
        await this.expire(key, time);
      }
      return Promise.resolve(incr);
    }
  }
}

module.exports = RedisStore;
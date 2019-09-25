
const debug = require('debug')('RATE_LIMITER:store');
const RedisStore = require('./redis');
const MemoryStore = require('./memory');
class Store {

  constructor(config, type, cb) {

    this.store = null;

    switch (type) {
      case 'redis':
        this.store = new RedisStore(config, cb);
        break;
      case 'memory':
        this.store = new MemoryStore();
        break;
      default:
        debug(`Store of type ${type} is not supported`);
        throw new Error('Store not supported');
    }

  }

  async handleRequest(key, window, limit) {

    try {
      const counter = await this.store.get(key);
      if (counter !== null && counter >= limit) {
        return Promise.reject('Max Limit Reached');
      } else {
        const incr = await this.store.incr(key);
        if (incr === 1) {
          await this.store.expire(key, window);
        }
        return Promise.resolve(incr);
      }

    } catch (error) {
      debug('Error occurred while store operation on keys', error);
      return Promise.reject(error);
    }

  }
}


module.exports = Store;
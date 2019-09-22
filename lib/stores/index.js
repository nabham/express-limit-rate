
const debug = require('debug')('RATE_LIMITER:store');
const RedisStore = require('./redis');

class Store {

  constructor(config, type, cb) {

    this.store = null;

    switch (type) {
      case 'redis':
        this.store = new RedisStore(config, cb);
        break;
      default:
        debug(`Store of type ${type} is not supported`);
        throw new Error('Store not supported');
    }

  }

  async handleRequest(key, window, limit) {

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
  }
}


module.exports = Store;
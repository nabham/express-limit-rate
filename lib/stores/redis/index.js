
const RedisConnector = require('./conn');
const { promisify } = require('util');
const debug = require('debug')('RATE_LIMITER:redis_store');

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
    this.initialize((err) => {
      if (err) {
        debug('Error occurred while initializing redis connection', err);
        return;
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
}

module.exports = RedisStore;
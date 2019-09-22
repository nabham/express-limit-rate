
const redis = require('redis');
const redisConf = require('../../config/redis.json');
const debug = require('debug')('RATE_LIMITER:redis');

function attachDefaults(config = {}) {

  const newConfig = {};
  const { host, port, password, db } = config;

  newConfig.host = host || redisConf.host;
  newConfig.port = port || redisConf.port;
  newConfig.password = password;
  newConfig.db = typeof (db) !== 'undefined' ? db : redisConf.db;

  newConfig.retry_strategy = (options) => {

    if (options.attempt > redisConf.retry.attempts) {
      debug(`Retries to redis exhausted. ${options.error}`);
      return new Error(`Retries to redis exhausted. ${options.error}`);
    }

    const nextRetry = Math.min(options.attempt * 500, redisConf.retry.intervalInMs);
    debug(`Retrying redis connection in ${nextRetry}ms`);

    return nextRetry;
  }

  return newConfig;
}

class RedisConnector {

  constructor(config) {
    this.config = attachDefaults(config);
    this._client = null;
  }

  initialize(cb) {
    let client = redis.createClient(this.config);

    client.on('connect', () => {
      debug('Redis connected successfully');
      this._client = client;
    });

    client.once('ready', () => {
      if (cb) {
        cb(null, client);
      }
    });

    client.on('error', (err) => {
      debug('Error thrown by Redis. Error', err);
    });

    client.on('end', () => {
      debug('Redis disconnected');
    });
  }

  disconnect() {
    this._client.quit((err) => {
      if (err) {
        debug(`Redis couldn't disconnect properly due to ${err}`);
        return;
      }
      debug('Redis disconnected gracefully');
    });
  }

  getClient() {
    return this._client;
  }
}

module.exports = RedisConnector;
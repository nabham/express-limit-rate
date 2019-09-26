
const Store = require('./stores');
const debug = require('debug')('RATE_LIMITER');
const utils = require('./utils/basic');
let store = null;

function initialize(config = {}) {
  store = new Store(config.store, config.type || 'redis');
}

function bucket(config) {

  config = utils.attachDefaultBucketParam(config);

  return (request, response, next) => {

    const key = utils.getValue(request, config.id);

    if (!store) {
      throw new Error('Store not initialized');
    }

    store
      .handleRequest(key, config.window, config.limit)
      .then((currentCounter) => {
        response.setHeader("X-RateLimit-Limit", config.limit);
        response.setHeader("X-RateLimit-Remaining", config.limit - currentCounter);
        next();
      })
      .catch((err) => {
        debug(`Max limit reached for ${config.id}`, err);
        response.setHeader("X-RateLimit-Limit", config.limit);
        response.setHeader("X-RateLimit-Remaining", 0);
        response
          .status(429)
          .json({ reason: config.message });
      });
  };

};

module.exports = {
  initialize,
  bucket
};
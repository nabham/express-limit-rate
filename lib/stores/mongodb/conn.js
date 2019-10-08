const { MongoClient } = require('mongodb');

const debug = require('debug')('RATE_LIMITER:mongo');

const config = require('../../config/mongodb.json');
const utils = require('../../utils/basic');

class MongoConnect {

  constructor(url = '', opts = {}) {
    this.options = Object.assign(opts, config.opts);
    utils.removeInvalidMongoProps(this.options);
    this.client = new MongoClient(url || config.url, this.options);
  }

  reconnect() {
    return new Promise(resolve => {
      setTimeout(() => {
        this.close()
          .then(() => this.connect())
          .then(resolve);
      }, this.options.reconnectInterval);
    })
  }

  async connect() {

    try {
      await this.client.connect();

      debug('MongoDB connection initialized');

      this.client.on('close', (reason) => {
        debug('MongoDB connection closed', reason);
      });

      return Promise.resolve(this.client);

    } catch (error) {
      debug(`Error occurred connecting to mongo`, error);
      return this.reconnect();
    }
  }

  getDb(db) {
    if (this.client) {
      return this.client.db(db || config.db)
    }
    return null;
  }

  isConnected() {
    return this.client.isConnected();
  }

  close() {
    if (this.client) {
      return this.client.close();
    }
    return Promise.resolve();
  }

}

module.exports = MongoConnect;
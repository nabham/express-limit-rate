const MongoConnector = require('./conn');

const defaultConfig = require('../../config/mongodb.json');

class MongoStore extends MongoConnector {

  constructor(config = {}) {
    super(config.url, config);

    this.collectionName = config.collectionName || defaultConfig.collection;
    this.dbName = config.dbName || defaultConfig.db;

    this.collection = null;

    this.connect()
      .then(() => {
        this.collection = this.getDb(this.dbName).collection(this.collectionName);
        this.collection.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 });
      });
  }

  incr(key, time) {
    const expireTime = new Date(Date.now() + (time * 1000));
    return this.collection.findOneAndUpdate({ id: key }, { $inc: { count: 1 }, $setOnInsert: { expireAt: expireTime } }, { upsert: true });
  }

  async runCountOperation(key, time) {
    let incr = await this.incr(key, time);
    if (!incr.value) {
      incr = 1;
    } else {
      incr = incr.value.count + 1;
    }
    return Promise.resolve(incr);
  }

}

module.exports = MongoStore;
const store = {};
const ttlMap = {};

class MemoryStore {

  constructor() { }

  set(key, val) {
    store[key] = val;
    return Promise.resolve();
  }

  get(key) {
    return Promise.resolve(store[key] || null);
  }

  incr(key) {
    if (!store[key]) {
      store[key] = 0;
    }
    store[key]++;
    return Promise.resolve(store[key]);
  }

  expire(key, time) {
    if (ttlMap[key]) {
      clearTimeout(ttlMap[key]);
    }
    ttlMap[key] = setTimeout(() => {
      delete store[key];
    }, time * 1000);
    return Promise.resolve();
  }

  async runCountOperation(key, time) {
    const incr = await this.incr(key);
    if (incr === 1) {
      await this.expire(key, time);
    }
    return Promise.resolve(incr);
  }
}

module.exports = MemoryStore;
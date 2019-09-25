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
}

module.exports = MemoryStore;
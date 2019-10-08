
function getValue(obj, key) {
  return key.split('.').reduce((newObj, curr) => (typeof (newObj) !== 'object' ? undefined : newObj[curr]), obj);
}

function removeInvalidMongoProps(config) {
  delete config.collectionName;
  delete config.dbName;
  delete config.url;
}

function attachDefaultBucketParam(config) {
  let newConfig = {};
  newConfig.id = config.id || 'connection.remoteAddress';
  newConfig.window = config.window || 60;
  newConfig.limit = config.limit || 10 ** 32;
  newConfig.message = config.message || 'Too Many Requests';
  return newConfig;
}

module.exports = {
  getValue,
  attachDefaultBucketParam,
  removeInvalidMongoProps
}
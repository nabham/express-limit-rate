
function getValue(obj, key) {
  return key.split('.').reduce((newObj, curr) => (typeof (newObj) !== 'object' ? undefined : newObj[curr]), obj);
}

module.exports = {
  getValue
}
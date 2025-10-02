const cache = new Map();

/**
 * Sets a value in the cache with a Time-To-Live (TTL).
 * @param {string} key - The key to store the data under.
 * @param {*} value - The value to store.
 * @param {number} ttl - The time to live in milliseconds.
 */
const set = (key, value, ttl) => {
  const expiresAt = Date.now() + ttl;
  cache.set(key, { value, expiresAt });
};

/**
 * Gets a value from the cache. Returns null if the key doesn't exist or has expired.
 * @param {string} key - The key to retrieve.
 * @returns {*} The cached value or null.
 */
const get = (key) => {
  const data = cache.get(key);
  if (!data) {
    return null;
  }

  // Check if the cache entry has expired
  if (Date.now() > data.expiresAt) {
    cache.delete(key); // Clean up expired entry
    return null;
  }

  return data.value;
};

/**
 * Clears the entire cache.
 */
const clear = () => {
  cache.clear();
};

module.exports = {
  get,
  set,
  clear,
};
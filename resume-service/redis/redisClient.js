const redis = require('redis');

const client = redis.createClient({
    url: 'redis://redis_cache:6379'
});

client.on('error', (err) => {
    console.error('Redis error:', err);
});

client.on('connect', () => {
    console.log('Connected to Redis');
});

const addToCache = async (key, value , ttl = 5) => {  
    try {
        const ttlSeconds = ttl * 1000;
        await client.set(key, JSON.stringify(value), 'PX', ttlSeconds);
    } catch (err) {
        console.error('Error adding to cache:', err);
    }
};

const getFromCache = async (key) => {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
};

const clearCache = async () => {
    await client.flushdb();
    console.log('Cache cleared');
};

module.exports = {
    client,
    addToCache,
    getFromCache,
    clearCache,
};

const cache = {};

const TTL = 60 * 1000;

function cacheMiddleware(req, res, next) {
    const key = req.originalUrl;
    const cachedValue = cache[key];

    if (cachedValue) {
        const age = Date.now() - cachedValue.createdAt;

        if (age < TTL) {
            res.set("X-Cache", "HIT");
            return res.json(cachedValue.data);
        }

        delete cache[key];
    }

    res.set("X-Cache", "MISS");

    const originalJson = res.json.bind(res);

    res.json = (data) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            cache[key] = {
                data: data,
                createdAt: Date.now()
            };
        }

        return originalJson(data);
    };

    next();
}

function clearCache() {
    for (const key in cache) {
        delete cache[key];
    }
}

module.exports = {
    cacheMiddleware,
    clearCache
};

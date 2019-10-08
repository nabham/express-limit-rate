# limiter

An express rate limiting library. Limits requests based on request object property.

**limiter** supports in-memory, mongo and redis store with atomicity among multi node processes.

### Installing
```
npm install @nabham/limiter
```

## Usage

```
var express = require('express');
var app = express();

var expressLimiter = require('@nabham/limiter');
expressLimiter.initialize({ type: 'redis' });

var bucket = expressLimiter.bucket({ limit: 10, window: 60 });

app.get('/', bucket, (req, res) => {
  res.send();
});
```

## Configuration

**limiter** support these parameters for initializing configuration.

### Redis store
```
{
  type: 'redis'
  store: {
    host: "127.0.0.1",      // Redis server hostname
    port: 6379,             // Redis server port
    db: 3                   // Redis database number
    atomic: true            // If atomicity needed among multi node process
  }
}
```
**NOTE**: Redis store is default store. If store configuration is not passed, it will fallback to default parameters shown above. In case of multi node processes set atomic property in store configuration.

### Memory store
```
{
  type: 'memory'
}
```
**NOTE**: Memory store doesn't require any configuration. Memory store does not work well in case of multi worker, as each worker will have its own heap space.

### Mongo store
```
{
  type: 'mongo',
  store: {
    url: 'mongodb://localhost:27017'     // Mongodb connection URI
    collectionName: 'limiter'            // Collection name
    dbName: 'ratelimit'                  // Database name
  }
}
```

*List of all available options under store can be found [here](https://mongodb.github.io/node-mongodb-native/3.3/reference/connecting/connection-settings/). If store configuration is not passed, it will fallback to default parameters shown above.*

**NOTE**: MongoDB store uses TTL index ( it helps in atomicity ) to set expiry which is monitored by [TTL monitor](http://hassansin.github.io/working-with-mongodb-ttl-index#ttlmonitor-sleep-interval) which by default runs every 60 seconds. It might affect correctness of limiter for upto 60 seconds, this might create problem when working with smaller windows. Either use redis, memory store for more granularity or decrease mongodb's TTL monitor [frequency](http://hassansin.github.io/working-with-mongodb-ttl-index#ttlmonitor-sleep-interval)


### bucket creation configuration

| Property | Default | Description |
| --- | --- | --- |
| id | connection.remoteAddress | Property to be taken from request object. For ex. token, username, connection.remoteAddress ( ip ) . connection.remoteAddress is the path of ip address in express request object. user.id if using passportjs.
| window | 60 | Time window in seconds in which rate limit will be applied.
| limit | Infinity | Number of requests allowed in window
| message | Too Many Requests | Message to be sent to client with 429 error code.

### Strategy

**limiter** works on the principle of sliding window algorithm. window in bucket configuration will start counting requests after first request and will reset once window time is over.

[Any suggestion is very much appreciated](https://github.com/nabham/limiter/issues)

## License

[The MIT License](https://opensource.org/licenses/MIT)


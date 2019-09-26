# limiter

An express rate limiting library. Limits requests based on request object property.

**limiter** supports in-memory and redis store with atomicity among multi node processes.

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

```
{
  type: 'redis'             // Type of store (redis and memory is supported)
  store: {
    host: "127.0.0.1",      // Redis server hostname
    port: 6379,             // Redis server port
    db: 3                   // Redis database number
    atomic: true            // If atomicity needed among multi node process
  }
}

or

{
  type: 'memory'
}
```
**NOTE** If store type is memory no store configuration is needed. This configuration is optional, if not passed will fallback to default parameters shown above. Default store is redis.

`In case of multi node processes set atomic property in store configuration. In-memory store does not work well in case of multi worker, as each worker will have its own heap space.`


### bucket creation configuration

| Property | Default | Description |
| --- | --- | --- |
| id | connection.remoteAddress | Property to be taken from request object. For ex. token, username, connection.remoteAddress ( ip ) . connection.remoteAddress is the path of ip address in express request object. user.id if using passportjs.
| window | 60 | Time window in seconds in which rate limit will be applied.
| limit | Infinity | Number of requests allowed in window
| message | Too Many Requests | Message to be sent to client with 429 error code.

### Strategy

**limiter** works on the principle of sliding window algorithm. window in bucket configuration will start counting requests after first request and will reset once window time is over.

## License

[The MIT License](https://opensource.org/licenses/MIT)
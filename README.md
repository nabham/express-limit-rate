# express-limit-rate

An express rate limiting library. Limits requests based on request object property.

**express-limit-rate** supports redis store till date. In-memory store is in pipeline.

### Installing
```
npm install express-limit-rate
```

## Usage

```
var express = require('express');
var app = express();

var expressLimiter = require('express-limit-rate');
expressLimiter.initialize({ type: 'redis' });

var bucket = expressLimiter.bucket({ limit: 10, window: 60 });

app.get('/', bucket, (req, res) => {
  res.send();
});
```

## Configuration

**express-limit-rate** support these parameters for initializing configuration.

```
{
  type: 'redis'             // Type of store (only redis supported)
  store: {
    host: "127.0.0.1",      // Redis server hostname
    port: 6379,             // Redis server port
    db: 3                   // Redis database number
  }
}
```
**NOTE**  *These configuration is optional, if not passed will fallback to default parameters shown above.*

*bucket* creation configuration

| Property | Default | Description |
| --- | --- | --- |
| id | connection.remoteAddress | Property to be taken from request object. For ex. token, username, connection.remoteAddress ( ip ) . connection.remoteAddress is the path of ip address in express request object. user.id if using passportjs.
| window | 60 | Time window in seconds in which rate limit will be applied.
| limit | Infinity | Number of requests allowed in window
| message | Too Many Requests | Message to be sent to client with 429 error code.

### Strategy

**express-limit-rate** works on the principle of sliding window algorithm. window in bucket configuration will start counting requests after first request and will reset once window time is over.

## License

[The MIT License](https://opensource.org/licenses/MIT)
const redis = require('redis')

const client = redis.createClient({
  host: '127.0.0.1', // localhost
  port: 6379,
})
client.on('error', (err) => {
  console.log(err)
})

const redisAction = {
  set: (key, value) => {
    client.set(key, value)
    return true
  }
}
module.exports = redisAction
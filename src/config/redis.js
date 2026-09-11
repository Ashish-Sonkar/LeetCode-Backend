const {createClient} = require('redis') ;

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'woodland-tulip-foremost-75621.db.redis.io',
        port: 16926
    }
});

module.exports=redisClient
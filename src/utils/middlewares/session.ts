import { __prod__ } from "../../constants";
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';


let RedisStore = connectRedis(session);
export let redis = new Redis();

export const sessionMiddleware = 		session({
    name: 'qid',
    saveUninitialized: false,
    store:
        new RedisStore({
            client: redis,
            disableTouch: true
            // disableTTL:true
        }),
    cookie:
        {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years
            httpOnly: true,
            secure: __prod__, //cookie only works in https
            sameSite: 'lax'
        },
    secret: 'this_is_my_secret',
    resave: false
})
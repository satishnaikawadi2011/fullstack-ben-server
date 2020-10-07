import { MyContext } from './types';
import { UserResolver } from './resolvers/user';
import { PostResolver } from './resolvers/post';

//TODO: using psql
//  psql -U postgres

// TODO: redis server run on windows
// C:\redis\redis-server.exe C:\redis\redis.windows.conf

import 'reflect-metadata';
import { HelloResolver } from './resolvers/hello';
import { Post } from './entities/Post';
import { __prod__ } from './constants';
import { MikroORM } from '@mikro-orm/core';
import mikroConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';

import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';

const PORT = process.env.PORT || 4000;
const main = async () => {
	const orm = await MikroORM.init(mikroConfig);
	await orm.getMigrator().up();
	const app = express();
	// app.get('/', (req, res) => {
	// 	res.send('Hello');
	// });

	let RedisStore = connectRedis(session);
	let redisClient = redis.createClient();

	app.use(
		session({
			name: 'qid',
			store:
				new RedisStore({
					client: redisClient,
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
	);

	const apolloServer = new ApolloServer({
		schema:
			await buildSchema({
				resolvers:
					[
						HelloResolver,
						PostResolver,
						UserResolver
					],
				validate: false
			}),
		context: ({ req, res }): MyContext => ({ em: orm.em, req, res })
	});

	apolloServer.applyMiddleware({ app });

	app.listen(PORT, () => {
		console.log(`Server listening on port ${PORT}`);
	});
	// const post = orm.em.create(Post, { title: 'Hey,this is first post !' });
	// await orm.em.persistAndFlush(post);
	// const posts = await orm.em.find(Post, {});
	// console.log(posts);
};

main().catch((err) => {
	console.log(err);
});

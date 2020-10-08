import { User } from './entities/User';
import { Post } from './entities/Post';
import { UserResolver } from './resolvers/user';
import { PostResolver } from './resolvers/post';

//TODO: using psql
//  psql -U postgres

// TODO: redis server run on windows
// C:\redis\redis-server.exe C:\redis\redis.windows.conf

import 'reflect-metadata';
import { HelloResolver } from './resolvers/hello';
import { __prod__ } from './constants';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import cors from 'cors';
import { createConnection } from 'typeorm';

import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';

const PORT = process.env.PORT || 4000;
const main = async () => {
	const conn = await createConnection({
		type: 'postgres',
		database: 'ben_awad_fullstack_2',
		username: 'postgres',
		password: 'postgres',
		logging: true,
		synchronize: true,
		entities:
			[
				Post,
				User
			]
	});
	const app = express();

	let RedisStore = connectRedis(session);
	let redisClient = redis.createClient();
	app.use(
		cors({
			origin: 'http://localhost:3000',
			credentials: true
		})
	);
	app.use(
		session({
			name: 'qid',
			saveUninitialized: false,
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
		context: ({ req, res }) => ({ req, res })
	});

	apolloServer.applyMiddleware({ app, cors: false });

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

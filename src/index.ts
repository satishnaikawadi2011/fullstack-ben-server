import { sessionMiddleware, redis } from './utils/middlewares/session';
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
import  {SampleResolver} from './resolvers/example';
import {createServer} from 'http'
import { __prod__ } from './constants';
import express from 'express';
import { ApolloServer,PubSub } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import cors from 'cors';
import { createConnection } from 'typeorm';

const pubsub = new PubSub()
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
	// await User.delete({});
	// await Post.delete({});
	const app = express();
	app.use(
		cors({
			origin: 'http://localhost:3000',
			credentials: true
		})
	);
	app.use(
		sessionMiddleware
	);

	const apolloServer = new ApolloServer({
		schema:
			await buildSchema({
				resolvers:
					[
						HelloResolver,
						PostResolver,
						UserResolver,
						SampleResolver
					],
				validate: false
			}),
		context: ({ req, res }) => ({ req, res, redis,connection:conn,pubsub }),
		subscriptions:{
			onConnect:(_,ws:any) =>  {
				// console.log(ws.upgradeReq);
				sessionMiddleware(ws.upgradeReq,{} as any,() => {
					// console.log(ws.upgradeReq.session);
					if(!ws.upgradeReq.session.userId){
						throw new Error("Not authenticated!")
					}
				})
			}
		}
	});

	apolloServer.applyMiddleware({ app, cors: false });
	const httpServer = createServer(app)
	apolloServer.installSubscriptionHandlers(httpServer)
	httpServer.listen(PORT, () => {
		// console.log(`Server listening on port ${PORT}`);
		console.log(`🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`)
		console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${apolloServer.subscriptionsPath}`)
	});
};

main().catch((err) => {
	console.log(err);
});

// psql -U postgres

import { Post } from './entities/Post';
import { __prod__ } from './constants';
import { MikroORM } from '@mikro-orm/core';
import mikroConfig from './mikro-orm.config';
import express from 'express';

const PORT = process.env.PORT || 4000;

const main = async () => {
	const orm = await MikroORM.init(mikroConfig);
	await orm.getMigrator().up();
	const app = express();
	app.get('/', (req, res) => {
		res.send('Hello');
	});
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

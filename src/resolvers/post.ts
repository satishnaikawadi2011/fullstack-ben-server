import { MyContext } from './../types';
import { Post } from './../entities/Post';
import { Ctx, Query, Resolver } from 'type-graphql';

@Resolver()
export class PostResolver {
	@Query(() => [
		Post
	])
	posts(@Ctx() ctx: MyContext) {
		return ctx.em.find(Post, {});
	}
}

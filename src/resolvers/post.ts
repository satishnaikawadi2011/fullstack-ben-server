import { isAuth } from './../utils/middlewares/isAuth';
import { MyContext } from './../types';
import { Post } from './../entities/Post';
import { Arg, Ctx, Query, Resolver, Int, Mutation, UseMiddleware } from 'type-graphql';

@Resolver()
export class PostResolver {
	@Query(() => [
		Post
	])
	posts(@Ctx() ctx: MyContext): Promise<Post[]> {
		return Post.find();
	}

	@Query(() => Post, { nullable: true })
	post(
		@Arg('id', () => Int)
		id: number,
		@Ctx() ctx: MyContext
	): Promise<Post | undefined> {
		return Post.findOne(id);
	}

	@Mutation(() => Post)
	@UseMiddleware(isAuth)
	async createPost(
		@Arg('title', () => String)
		title: string,
		@Arg('text', () => String)
		text: string,
		@Ctx() { req }: MyContext
	): Promise<Post> {
		return Post.create({ title, text, creatorId: req.session.userId }).save();
	}

	@Mutation(() => Post)
	async updatePost(
		@Arg('id', () => Int)
		id: number,
		@Arg('title', () => String)
		title: string,
		@Ctx() ctx: MyContext
	): Promise<Post | null> {
		const post = await Post.findOne(id);
		if (!post) {
			return null;
		}

		if (typeof title !== 'undefined') {
			await Post.update({ id }, { title });
		}
		post.title = title;
		return post;
	}

	@Mutation(() => Boolean)
	async deletePost(
		@Arg('id', () => Int)
		id: number,
		@Ctx() ctx: MyContext
	): Promise<boolean> {
		await Post.delete({ id });
		return true;
	}
}

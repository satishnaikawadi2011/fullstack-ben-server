import { MyContext } from './../types';
import { Post } from './../entities/Post';
import { Arg, Ctx, Query, Resolver, Int, Mutation } from 'type-graphql';

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
	async createPost(
		@Arg('title', () => String)
		title: string,
		@Ctx() ctx: MyContext
	): Promise<Post> {
		return Post.create({ title }).save();
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
			// post.title = title;
			await Post.update({ id }, { title });
		}
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

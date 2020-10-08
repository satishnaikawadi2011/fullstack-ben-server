import { User } from './../entities/User';
import { MyContext } from './../types';
import { Resolver, Mutation, InputType, Field, Arg, Ctx, ObjectType, Query } from 'type-graphql';
import argon2 from 'argon2';

@InputType()
class RegisterInput {
	@Field() username: string;

	@Field() password: string;
}

@ObjectType()
class Error {
	@Field() field: string;

	@Field() message: string;
}

@ObjectType()
class UserResponse {
	@Field(
		() => [
			Error
		],
		{ nullable: true }
	)
	errors?: Error[];

	@Field(() => User, { nullable: true })
	user?: User;
}

@Resolver()
export class UserResolver {
	@Query(() => User, { nullable: true })
	async me(@Ctx() { req }: MyContext) {
		// Not logged in
		if (!req.session.userId) {
			return null;
		}

		const user = await User.findOne({ id: req.session.userId });
		return user;
	}

	@Mutation(() => UserResponse)
	async register(@Arg('options') options: RegisterInput, @Ctx() { req }: MyContext): Promise<UserResponse> {
		const { username, password } = options;
		const existingUser = await User.findOne({ username });
		if (existingUser) {
			return {
				errors:
					[
						{
							field: 'username',
							message: 'username already taken  !!'
						}
					]
			};
		}
		if (username.length <= 2) {
			return {
				errors:
					[
						{
							field: 'username',
							message: 'username length must be greater than 2 !!'
						}
					]
			};
		}

		if (password.length <= 5) {
			return {
				errors:
					[
						{
							field: 'password',
							message: 'password length must be greater than 5 !!'
						}
					]
			};
		}
		const hashedPassword = await argon2.hash(password);
		const user = await User.create({ username, password: hashedPassword }).save();
		req.session.userId = user.id;
		return { user };
	}

	@Mutation(() => UserResponse)
	async login(@Arg('options') options: RegisterInput, @Ctx() { req }: MyContext): Promise<UserResponse> {
		const { username, password } = options;
		const user = await User.findOne({ username });
		if (!user) {
			return {
				errors:
					[
						{
							field: 'username',
							message: 'User with this username could not exist !'
						}
					]
			};
		}
		const valid = await argon2.verify(user.password, password);
		if (!valid) {
			return {
				errors:
					[
						{
							field: 'password',
							message: 'Incorrect password !'
						}
					]
			};
		}
		req.session.userId = user.id;
		return {
			user
		};
	}

	@Mutation(() => Boolean)
	logout(@Ctx() { req, res }: MyContext) {
		return new Promise((resolve) =>
			req.session.destroy((err) => {
				if (err) {
					console.log(err);

					resolve(false);
					return;
				}
				res.clearCookie('qid');
				resolve(true);
			})
		);
	}
}

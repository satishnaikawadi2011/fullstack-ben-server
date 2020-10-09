import { FORGOT_PASSWORD_PREFIX } from './../constants';
import { SignUpEmail } from './../utils/emailSending/emailTemplates';
import { sendEmail } from './../utils/emailSending/sendEmail';
import { validateLogin } from './../utils/validators/validateLogin';
import { handleRegistererrors } from '../utils/validators/registerErrorHandling';
import { User } from './../entities/User';
import { MyContext } from './../types';
import { Resolver, Mutation, InputType, Field, Arg, Ctx, ObjectType, Query, FieldResolver, Root } from 'type-graphql';
import argon2 from 'argon2';
import { v4 } from 'uuid';

@InputType()
class RegisterInput {
	@Field() username: string;

	@Field() password: string;

	@Field() email: string;
}

@InputType()
class LoginInput {
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

@Resolver(User)
export class UserResolver {

	@FieldResolver(() => String)
	email(@Root() user:User,@Ctx() {req}:MyContext){
		if(req.session.userId === user.id){
			return user.email
		}
		return ""
	}

	@Mutation(() => UserResponse)
	async changePassword(
		@Arg('newPassword') newPassword: string,
		@Arg('token') token: string,
		@Ctx() { redis, req }: MyContext
	): Promise<UserResponse> {
		if (newPassword.length <= 5) {
			return {
				errors:
					[
						{
							field: 'newPassword',
							message: 'Length of new password must be grater than 5!'
						}
					]
			};
		}

		const userId = await redis.get(FORGOT_PASSWORD_PREFIX + token);
		if (!userId) {
			return {
				errors:
					[
						{
							field: 'token',
							message: 'Token expired !'
						}
					]
			};
		}
		const user = await User.findOne({ id: parseInt(userId) });
		if (!user) {
			return {
				errors:
					[
						{
							field: 'token',
							message: 'user does not exists!'
						}
					]
			};
		}
		const hashedPassword = await argon2.hash(newPassword);
		await User.update({ id: parseInt(userId) }, { password: hashedPassword });
		await redis.del(FORGOT_PASSWORD_PREFIX + token);
		req.session.userId = user.id;
		return { user };
	}

	@Mutation(() => Boolean)
	async forgotPassword(@Arg('email') email: string, @Ctx() { redis }: MyContext) {
		const user = await User.findOne({ email });
		if (!user) {
			return true;
		}
		const token = v4();
		await redis.set(FORGOT_PASSWORD_PREFIX + token, user.id, 'ex', 1000 * 60 * 60 * 24 * 3); //3 days
		sendEmail({
			to: email,
			subject: 'Change Password',
			html: `<a href="http://localhost:3000/change-password/${token}">Reset password</a>`
		});
		return true;
	}

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
		const { username, password, email } = options;
		const { isValid, errors } = await handleRegistererrors({ email, password, username });
		if (!isValid) {
			return { errors };
		}
		const hashedPassword = await argon2.hash(password);
		const user = await User.create({ username, password: hashedPassword, email }).save();
		sendEmail({ to: email, subject: SignUpEmail.subject, html: SignUpEmail.html });
		req.session.userId = user.id;
		return { user };
	}

	@Mutation(() => UserResponse)
	async login(@Arg('options') options: LoginInput, @Ctx() { req }: MyContext): Promise<UserResponse> {
		const { username, password } = options;
		const user = await User.findOne({ username });
		const { isValid, errors } = await validateLogin({ password, user });
		if (!isValid) {
			return { errors };
		}
		if (user) {
			req.session.userId = user.id;
		}
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

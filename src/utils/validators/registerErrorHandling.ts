import { User } from '../../entities/User';

type InputType = {
	email: string;
	password: string;
	username: string;
};

export const handleRegistererrors = async ({ email, password, username }: InputType) => {
	if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email) === false) {
		return {
			isValid: false,
			errors:
				[
					{
						field: 'email',
						message: 'Please enter a valid email address !'
					}
				]
		};
	}
	const existingUser = await User.findOne({
		where:
			[
				{ email },
				{ username }
			]
	});
	if (existingUser) {
		return {
			isValid: false,
			errors:
				[
					{
						field: 'username',
						message: 'Username or email is already taken,please try another one!'
					},
					{
						field: 'email',
						message: 'Username or email is already taken,please try another one!'
					}
				]
		};
	}

	if (username.length <= 2) {
		return {
			isValid: false,
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
			isValid: false,
			errors:
				[
					{
						field: 'password',
						message: 'password length must be greater than 5 !!'
					}
				]
		};
	}
	return { isValid: true, errors: [] };
};

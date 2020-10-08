import argon2 from 'argon2';
import { User } from '../../entities/User';

type LoginInputType = {
	password: string;
	user: User | undefined;
};

export const validateLogin = async ({ password, user }: LoginInputType) => {
	if (!user) {
		return {
			isValid: false,
			errors:
				[
					{
						field: 'username',
						message: 'User with this username does not exist !'
					}
				]
		};
	}
	const valid = await argon2.verify(user.password, password);
	if (!valid) {
		return {
			isValid: false,
			errors:
				[
					{
						field: 'password',
						message: 'Incorrect password !'
					}
				]
		};
	}
	return { isValid: true, errors: [] };
};

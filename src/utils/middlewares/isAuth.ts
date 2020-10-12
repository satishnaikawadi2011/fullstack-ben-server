import { MyContext } from 'src/types';
import { Middleware } from 'type-graphql/dist/interfaces/Middleware';

export const isAuth: Middleware<MyContext> = ({ context }, next) => {
	console.log('I am here');
	
	if (!context.req.session.userId) {
		throw new Error('Not authenticated !');
	}
	return next();
};

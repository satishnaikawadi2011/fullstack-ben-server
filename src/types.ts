import { Request, Response, Express } from 'express';
import { Redis } from 'ioredis';
import { Connection } from 'typeorm';

export type MyContext = {
	req: Request & { session: Express.Session };
	res: Response;
	redis: Redis;
	connection: Connection
};

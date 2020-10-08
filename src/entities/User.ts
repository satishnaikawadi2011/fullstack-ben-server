import { Post } from './Post';
import { Field, Int, ObjectType } from 'type-graphql';
import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
	BaseEntity,
	OneToMany
} from 'typeorm';

@ObjectType()
@Entity()
export class User extends BaseEntity {
	@Field(() => Int)
	@PrimaryGeneratedColumn()
	id: number;

	@Field(() => String)
	@CreateDateColumn()
	createdAt: Date;

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt: Date;

	@Field(() => String)
	@Column({ unique: true })
	username: string;

	@Column() password: string;

	@OneToMany(() => Post, (post) => post.creator)
	posts: Post[];
}

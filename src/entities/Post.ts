import { User } from './User';
import { Field, Int, ObjectType } from 'type-graphql';
import {
	Entity,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	Column,
	BaseEntity,
	ManyToOne
} from 'typeorm';

@ObjectType()
@Entity()
export class Post extends BaseEntity {
	@Field(() => Int)
	@PrimaryGeneratedColumn()
	id: number;

	@Field(() => String)
	@CreateDateColumn({ type: 'date' })
	createdAt: Date;

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt: Date;

	@Field()
	@Column()
	creatorId: number;

	@Field(() => String)
	@Column()
	title: string;

	@ManyToOne(() => User, (user) => user.posts)
	creator: User;
}

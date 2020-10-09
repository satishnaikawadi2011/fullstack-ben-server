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

	@Field(() => User)
	@ManyToOne(() => User, (user) => user.posts)
	creator: User;

	@Field()
	@Column()
	creatorId: number;

	@Field(() => String)
	@Column()
	title: string;

	@Field(() => String)
	@Column()
	text: string;

	@Field(() => Int)
	@Column({ type: 'int', default: 0 })
	points: number;
}

import { PubSubEngine } from "graphql-subscriptions";
import {
  Resolver,
  Query,
  Mutation,
  Arg,
  PubSub,
//   Publisher,
  Subscription,
  Root,
  ResolverFilterData,
  ObjectType,
  ID,
  Field,
} from "type-graphql";

@ObjectType()
 class Notification {
  @Field(() => ID)
  id: number;

  @Field({ nullable: true })
  message?: string;

  @Field(() => Date)
  date: Date;
}

 interface NotificationPayload {
  id: number;
  message?: string;
}

@Resolver()
export class SampleResolver {
  private autoIncrement = 0;

  @Query(() => Date)
  currentDate() {
    return new Date();
  }

  @Mutation(() => Boolean)
  async pubSubMutation(
    @PubSub() pubSub: PubSubEngine,
    @Arg("message", { nullable: true }) message?: string,
  ): Promise<boolean> {
    const payload: NotificationPayload = { id: ++this.autoIncrement, message };
    await pubSub.publish("NOTIFICATIONS", payload);
    return true;
  }

//   @Mutation(() => Boolean)
//   async publisherMutation(
//     @PubSub("NOTIFICATIONS") publish: Publisher<NotificationPayload>,
//     @Arg("message", { nullable: true }) message?: string,
//   ): Promise<boolean> {
//     await publish({ id: ++this.autoIncrement, message });
//     return true;
//   }

  @Subscription({ topics: "NOTIFICATIONS" })
  normalSubscription(@Root() { id, message }: NotificationPayload): Notification {
    return { id, message, date: new Date() };
  }

  @Subscription(() => Notification, {
    topics: "NOTIFICATIONS",
    filter: ({ payload }: ResolverFilterData<NotificationPayload>) => payload.id % 2 === 0,
  })
  subscriptionWithFilter(@Root() { id, message }: NotificationPayload) {
    const newNotification: Notification = { id, message, date: new Date() };
    return newNotification;
  }

  // dynamic topic

  @Mutation(() => Boolean)
  async pubSubMutationToDynamicTopic(
    @PubSub() pubSub: PubSubEngine,
    @Arg("topic") topic: string,
    @Arg("message", { nullable: true }) message?: string,
  ): Promise<boolean> {
    const payload: NotificationPayload = { id: ++this.autoIncrement, message };
    await pubSub.publish(topic, payload);
    return true;
  }

//   @Subscription({
//     topics: ({ args }) => args.topic,
//   })
//   subscriptionWithFilterToDynamicTopic(
//     @Arg("topic") topic: string,
//     @Root() { id, message }: NotificationPayload,
//   ): Notification {
//     return { id, message, date: new Date() };
//   }
}

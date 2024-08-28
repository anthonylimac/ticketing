import {
  Publisher,
  OrderCreatedEvent,
  Subjects,
} from '@anthonyctickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}

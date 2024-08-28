import {
  OrderCancelledEvent,
  Subjects,
  Publisher,
} from '@anthonyctickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}

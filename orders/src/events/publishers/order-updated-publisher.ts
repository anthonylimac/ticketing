import {
  Publisher,
  OrderUpdatedEvent,
  Subjects,
} from '@anthonyctickets/common';

export class OrderUpdatedPublisher extends Publisher<OrderUpdatedEvent> {
  readonly subject = Subjects.OrderUpdated;
}

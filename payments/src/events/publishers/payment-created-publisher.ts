import {
  Publisher,
  Subjects,
  PaymentCreatedEvent,
} from '@anthonyctickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}

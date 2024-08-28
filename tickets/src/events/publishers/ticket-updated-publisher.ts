import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from '@anthonyctickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}

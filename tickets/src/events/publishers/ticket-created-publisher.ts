import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from '@anthonyctickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}

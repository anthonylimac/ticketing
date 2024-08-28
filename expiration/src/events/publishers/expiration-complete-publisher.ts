import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from '@anthonyctickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}

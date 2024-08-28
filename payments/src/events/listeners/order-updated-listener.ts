import { Listener, OrderUpdatedEvent, Subjects } from '@anthonyctickets/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';

export class OrderUpdatedListener extends Listener<OrderUpdatedEvent> {
  readonly subject = Subjects.OrderUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderUpdatedEvent['data'], msg: Message) {
    console.log('updating order id:', data.id, 'with version:', data.version);
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({
      status: data.status,
      expiresAt: data.expiresAt,
    });
    await order.save();
    msg.ack();
  }
}

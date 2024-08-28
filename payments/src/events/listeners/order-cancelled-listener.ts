import {
  OrderCancelledEvent,
  Subjects,
  Listener,
  OrderStatus,
} from '@anthonyctickets/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const order = await Order.findOne({
      _id: data.id,
      version: data.version,
    });

    if (!order) {
      throw new Error('Order not found from order-cancelled-listener');
    }
    order.set({ status: OrderStatus.Cancelled });

    await order.save();

    msg.ack();
  }
}

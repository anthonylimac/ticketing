import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { OrderStatus } from '@anthonyctickets/common';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';

const createTicket = async () => {
  const ticket = Ticket.build({
    title: 'show da madona',
    price: 2000,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();
  return ticket;
};

it('should cancel a order', async () => {
  const ticket = await createTicket();
  const cookie = global.signin();

  const { body } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201);
  expect(body.status).toEqual(OrderStatus.Created);

  const { body: orderBody } = await request(app)
    .delete(`/api/orders/${body.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(204);
  expect(orderBody).toBeNull;

  const canceledOrder = await Order.findById(body.id);
  expect(canceledOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('sould not allow a user not authenticated to cancel an order', async () => {
  const ticket = await createTicket();
  const cookie = global.signin();

  const { body } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body: orderResponse } = await request(app)
    .delete(`/api/orders/${body.id}`)
    .send()
    .expect(401);
});

it('shout return 404 if a order was not found', async () => {
  const ticket = await createTicket();
  const cookie = global.signin();

  const { body } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  const orderBody = await Order.find({});

  expect(orderBody!.length).toEqual(1);

  const { body: responseBody } = await request(app)
    .delete(`/api/orders/${new mongoose.Types.ObjectId()}`)
    .set('Cookie', cookie)
    .expect(404);
});

it('should return 404 if user tries to cancel someone others order', async () => {
  const ticketOne = await createTicket();
  const cookieOne = global.signin();

  const { body: orderOneResp } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookieOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);
  expect(orderOneResp.id).not.toBeNull;
  expect(orderOneResp.status).toEqual(OrderStatus.Created);

  const ticketTwo = await createTicket();
  const cookieTwo = global.signin();

  const { body: orderTwoResp } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookieTwo)
    .send({ ticketId: ticketTwo.id })
    .expect(201);
  expect(orderTwoResp.id).not.toBeNull;
  expect(orderTwoResp.status).toEqual(OrderStatus.Created);

  const { body: deletedOrder } = await request(app)
    .delete(`/api/orders/${orderOneResp.id}`)
    .set('Cookie', cookieTwo)
    .send()
    .expect(401);
});

it('emits an event when an order is canceled', async () => {
  const ticket = await createTicket();
  const cookie = global.signin();

  const { body } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201);
  expect(body.status).toEqual(OrderStatus.Created);

  const { body: orderBody } = await request(app)
    .delete(`/api/orders/${body.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(204);
  expect(orderBody).toBeNull;
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

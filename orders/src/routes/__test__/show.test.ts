import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

const createTicket = async () => {
  const tickets = Ticket.build({
    title: 'show da madona',
    price: 2000,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await tickets.save();
  return tickets;
};

it('fetches the order', async () => {
  // Create a ticket
  const ticket = await createTicket();

  const cookie = global.signin();
  // Make a request to build an order with this ticket

  const { body: order } = await request(app)
    .post(`/api/orders`)
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  // Make request to fetch the orderw

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(order.id).toEqual(fetchedOrder.id);
});

it('should not allow a user to see others orders', async () => {
  const ticketOne = await createTicket();

  const userOne = global.signin();

  const { body: response } = await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);
  expect(response.ticket.id).toEqual(ticketOne.id);

  const ticketTwo = await createTicket();

  const userTwo = global.signin();

  const { body: res } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticketTwo.id })
    .expect(201);
  expect(res.ticket.id).toEqual(ticketTwo.id);

  const { body } = await request(app)
    .get(`/api/orders/${response.id}`)
    .set('Cookie', userTwo)
    .send()
    .expect(401);
});

it('should retur 404 if a order was not found', async () => {
  const ticket = await createTicket();
  const cookie = global.signin();

  const { body: response } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body } = await request(app)
    .post(`/api/orders/${new mongoose.Types.ObjectId()}`)
    .set('Cookie', cookie)
    .send()
    .expect(404);
});

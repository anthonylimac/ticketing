import request from 'supertest';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { OrderStatus } from '@anthonyctickets/common';
import { app } from '../../app';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

const setup = async () => {
  const cookie = global.signin();
  const price = Math.floor(Math.random() * 100000);
  const id = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: id,
    status: OrderStatus.Created,
    price,
  });
  await order.save();

  return { order, cookie, id, price };
};

it('should throw an error if a non existed order is to be payed', async () => {
  const orderId = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      orderId: orderId,
      token: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('should not allow a user to pay someones others order', async () => {
  const { order, cookie } = await setup();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      orderId: order.id,
      token: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(401);
});

it('should not allow a user to pay for a cancelled order', async () => {
  const { order, cookie, id } = await setup();

  order.set({ status: OrderStatus.Cancelled });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(id))
    .send({
      orderId: order.id,
      token: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(400);
});

it('show retur a 200 if a payment is created', async () => {
  const { order, cookie, id } = await setup();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(id))
    .send({
      orderId: order.id,
      token: 'tok_visa',
    })
    .expect(201);
});

it('returns a 201 with valid inputs', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const price2 = Math.floor(Math.random() * 100000);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: id,
    status: OrderStatus.Created,
    price: price2,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(id))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);

  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find((charge) => {
    return charge.amount === price2 * 100;
  });
  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual('usd');
});

it('returns a 201 with valid inputs', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const price2 = Math.floor(Math.random() * 100000);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: id,
    status: OrderStatus.Created,
    price: price2,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(id))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);

  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find((charge) => {
    return charge.amount === price2 * 100;
  });

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual('usd');

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id,
  });

  expect(payment).not.toBeNull();
});

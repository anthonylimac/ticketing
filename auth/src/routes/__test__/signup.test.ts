import request from 'supertest';
import { app } from '../../app';

it('returns a 201 on sucessful signup', async () => {
  return request(app)
    .post('/api/users/signup')
    .expect('Content-Type', /json/)
    .send({
      email: 'test@test2.com',
      password: 'password',
    })
    .expect(201);
});

it('returns a 400 on failed signup using a invalid email address', async () => {
  return request(app)
    .post('/api/users/signup')
    .expect('Content-Type', /json/)
    .send({
      email: 'teste.test.com',
      password: '12345',
    })
    .expect(400);
});

it('returns a 400 on failed signup using a invalid password', async () => {
  await request(app)
    .post('/api/users/signup')
    .expect('Content-Type', /json/)
    .send({
      email: '',
      password: '',
    })
    .expect(400);
  await request(app)
    .post('/api/users/signup')
    .expect('Content-Type', /json/)
    .send({
      email: 'teste.test.com',
      password: '123',
    })
    .expect(400);
});

it('returns a 400 on signing up a duplicate email account', async () => {
  await request(app)
    .post('/api/users/signup')
    .expect('Content-Type', /json/)
    .send({
      email: 'teste@test.com',
      password: '12345',
    })
    .expect(201);
  await request(app)
    .post('/api/users/signup')
    .expect('Content-Type', /json/)
    .send({
      email: 'teste@test.com',
      password: '12345',
    })
    .expect(400);
});

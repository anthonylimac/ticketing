import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
  var signin: (id?: string) => string[];
}

let mongo: any;

jest.mock('../nats-wrapper');

process.env.STRIPE_KEY =
  'sk_test_51PsADpFTvCE3L4eMOjFeMW5kD1Hn3CqTnFB6RKuaK8p3rha6ghSimVfQzzHI5SqJQC24wvJYpAIKXdBgNFtaObkZ00jDofibpU';

beforeAll(async () => {
  process.env.JWT_KEY = 'asdasd';
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  const collections = await mongoose.connection?.db?.collections();
  for (let collection of collections!) {
    await collection.deleteMany({});
  }
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.signin = (id?: string) => {
  //build a JWT payload. { id, email}
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'teste@test.com',
  };

  //Create the JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  //Build a session Object/ {jwt: MY_JWT}
  const session = { jwt: token };

  //turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  //take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  //return a string that is a cookie encoding data
  return [`session=${base64}`];
};

import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
  const ticket = Ticket.build({
    userId: 'ashahs',
    title: 'alanis',
    price: 200,
  });
  await ticket.save();

  const ticketOneGet = await Ticket.findById(ticket.id);
  const ticketTwoGet = await Ticket.findById(ticket.id);

  ticketOneGet!.set({ price: 10 });
  await ticketOneGet!.save();

  ticketTwoGet!.set({ price: 9999 });
  try {
    await ticketTwoGet!.save();
  } catch (err) {
    return;
  }
  throw new Error('Should not reach this point');
});

it('increments the version number on multiple saves', async () => {
  const ticket = Ticket.build({
    userId: 'ashahs',
    title: 'alanis',
    price: 200,
  });
  await ticket.save();
  let versionTicket = await Ticket.findById(ticket.id);
  expect(versionTicket?.version).toEqual(0);

  const ticketOneGet = await Ticket.findById(ticket.id);
  ticketOneGet!.set({ price: 10 });
  await ticketOneGet!.save();
  versionTicket = await Ticket.findById(ticket.id);
  expect(versionTicket?.version).toEqual(1);

  const ticketTwoGet = await Ticket.findById(ticket.id);
  ticketTwoGet!.set({ price: 10 });
  await ticketTwoGet!.save();
  versionTicket = await Ticket.findById(ticket.id);
  expect(versionTicket?.version).toEqual(2);
});

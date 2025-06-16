import { prisma } from '../lib/prisma';

async function main() {
  const alice = await prisma.user.upsert({
    where: { email: 'alice@prisma.io' },
    update: {},
    create: {
      email: 'alice@prisma.io',
      name: 'Alice',
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@prisma.io' },
    update: {},
    create: {
      email: 'bob@prisma.io',
      name: 'Bob',
    },
  });

  const client1 = await prisma.client.upsert({
    where: { email: 'client1@email.com' },
    update: {},
    create: {
      name: 'Client 1',
      email: 'client1@email.com',
      userId: alice.id,
    },
  });

  const client2 = await prisma.client.upsert({
    where: { email: 'client2@email.com' },
    update: {},
    create: {
      name: 'Client 2',
      email: 'client2@email.com',
      userId: bob.id,
    },
  });

  const project1 = await prisma.project.create({
    data: {
      name: 'Project 1',
      userId: alice.id,
      clients: {
        connect: {
          id: client1.id,
        },
      },
    },
  });

  const song1 = await prisma.song.create({
    data: {
      name: 'Song 1',
      projectId: project1.id,
    },
  });

  const variation1 = await prisma.variation.create({
    data: {
      name: 'Variation 1',
      songId: song1.id,
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    },
  });

  await prisma.comment.create({
    data: {
      content: 'This is a comment from Alice',
      variationId: variation1.id,
      userId: alice.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'This is a comment from Bob',
      variationId: variation1.id,
      userId: bob.id,
    },
  });

  console.log({ alice, bob, client1, client2, project1, song1, variation1 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
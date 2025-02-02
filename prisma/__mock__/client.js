const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const { join } = require('path');

const generateDatabaseURL = () => {
  if (!process.env.DATABASE_URL_TESTING) {
    throw new Error('Please provide a database URL.');
  }
  let url = process.env.DATABASE_URL_TESTING;

  url = url.replace('/neondb', '/testingDb');
  return url;
};

const prismaBinary = join(__dirname, '..', '..', 'node_modules', '.bin', 'prisma');

const url = generateDatabaseURL();

process.env.DATABASE_URL_TESTING = url;

const prisma = new PrismaClient({
  datasources: { db: { url } },
});

beforeAll(async () => {
  execSync(`${prismaBinary} db push`, {
    env: {
      ...process.env,
      DATABASE_URL_TESTING: url,
    },
  });
});

beforeEach(async () => {
  await prisma.user.deleteMany();
  await prisma.token.deleteMany();
});

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS testingDb`);
  await prisma.$disconnect();
});

module.exports = prisma;

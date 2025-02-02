const bcrypt = require('bcryptjs');
const { v4 } = require('uuid');
const { faker } = require('@faker-js/faker');
const prisma = require('../../prisma/client');

const password = 'password1#';
const salt = bcrypt.genSaltSync(8);
const hashedPassword = bcrypt.hashSync(password, salt);

const userOne = {
  id: v4(),
  name: faker.person.fullName(),
  email: faker.internet.email().toLowerCase(),
  password: hashedPassword,
  role: 'user',
};

const userTwo = {
  id: v4(),
  name: faker.person.fullName(),
  email: faker.internet.email().toLowerCase(),
  password: hashedPassword,
  role: 'user',
};

const admin = {
  id: v4(),
  name: faker.person.fullName(),
  email: faker.internet.email().toLowerCase(),
  password: hashedPassword,
  role: 'admin',
};

const insertUsers = async (users) => {
  await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });
};

module.exports = {
  userOne,
  userTwo,
  admin,
  insertUsers,
};

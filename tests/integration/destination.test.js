const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const prisma = require('../../prisma/client');
const { userOne, admin, insertUsers } = require('../fixtures/user.fixture');
const { category, insertCategories } = require('../fixtures/category.fixture');
const { destination, insertDestinations } = require('../fixtures/destination.fixture');
const tokenService = require('../../src/services/token.service');

describe('Destinations Routes', () => {
  beforeAll(async () => {
    await prisma.user.deleteMany();
    await prisma.token.deleteMany();
    await prisma.category.deleteMany();
  });

  beforeEach(async () => {
    await insertUsers([userOne, admin]);
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.token.deleteMany();
    await prisma.category.deleteMany();
  });

  describe('Destinations API', () => {
    test('should return 201 and successfully create a new destination if request data is valid', async () => {
      await insertCategories(category);
      const token = await tokenService.generateAuthTokens(userOne);
      await request(app)
        .post('/v1/destinations')
        .set('Authorization', `Bearer ${token.access.token}`)
        .send({
          placeName: 'New Destination',
          description: 'A beautiful place',
          address: '123 Main St',
          categoryId: category.id, // ID kategori yang valid
        })
        .expect(httpStatus.CREATED);
    });

    test('should return 200 and successfully get all destinations', async () => {
      await insertCategories(category);
      await insertDestinations(destination);
      const token = await tokenService.generateAuthTokens(userOne);
      await request(app).get('/v1/destinations').set('Authorization', `Bearer ${token.access.token}`).expect(httpStatus.OK);
    });

    test('should return 200 and successfully get destination by id', async () => {
      await insertCategories(category);
      await insertDestinations(destination);
      const token = await tokenService.generateAuthTokens(userOne);
      await request(app)
        .get(`/v1/destinations/${destination.id}`)
        .set('Authorization', `Bearer ${token.access.token}`)
        .expect(httpStatus.OK);
    });

    test('should return 200 and successfully update destination if request data is valid', async () => {
      await insertCategories(category);
      await insertDestinations(destination);
      const token = await tokenService.generateAuthTokens(admin);
      await request(app)
        .patch(`/v1/destinations/${destination.id}`)
        .set('Authorization', `Bearer ${token.access.token}`)
        .send({
          placeName: 'Updated Destination',
          description: 'Updated beautiful place',
        })
        .expect(httpStatus.OK);
    });

    test('should return 200 and successfully delete destination if request data is valid', async () => {
      await insertCategories(category);
      await insertDestinations(destination);
      const token = await tokenService.generateAuthTokens(admin);
      await request(app)
        .delete(`/v1/destinations/${destination.id}`)
        .set('Authorization', `Bearer ${token.access.token}`)
        .expect(httpStatus.OK);
    });
  });
});

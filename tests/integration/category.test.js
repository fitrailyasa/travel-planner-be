const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const prisma = require('../../prisma/client');
const { userOne, admin, insertUsers } = require('../fixtures/user.fixture');
const { category, insertCategories } = require('../fixtures/category.fixture');
const tokenService = require('../../src/services/token.service');

describe('Category Routes', () => {
  beforeAll(async () => {
    await prisma.user.deleteMany();
    await prisma.token.deleteMany();
  });

  beforeEach(async () => {
    await insertUsers([userOne, admin]);
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.token.deleteMany();
  });

  describe('Category API', () => {
    test('should return 201 and successfully created category if request data is valid', async () => {
      const token = await tokenService.generateAuthTokens(admin);
      await request(app)
        .post('/v1/categories')
        .set('Authorization', `Bearer ${token.access.token}`)
        .send({
          name: 'New Category',
          imageUrl: 'https://example.com/image.jpg',
        })
        .expect(httpStatus.CREATED);
    });

    test('should return 200 and successfully get all categories', async () => {
      await insertCategories(category);
      const token = await tokenService.generateAuthTokens(admin);
      await request(app).get('/v1/categories').set('Authorization', `Bearer ${token.access.token}`).expect(httpStatus.OK);
    });

    test('should return 200 and successfully get category by id', async () => {
      await insertCategories(category);
      const token = await tokenService.generateAuthTokens(userOne);
      await request(app)
        .get(`/v1/categories/${category.id}`)
        .set('Authorization', `Bearer ${token.access.token}`)
        .expect(httpStatus.OK);
    });

    test('should return 200 and successfully update category if request data is valid', async () => {
      await insertCategories(category);
      const token = await tokenService.generateAuthTokens(admin);
      await request(app)
        .patch(`/v1/categories/${category.id}`)
        .set('Authorization', `Bearer ${token.access.token}`)
        .send({
          name: 'Updated Category',
        })
        .expect(httpStatus.OK);
    });

    test('should return 200 and successfully delete category if request data is valid', async () => {
      await insertCategories(category);
      const token = await tokenService.generateAuthTokens(admin);
      await request(app)
        .delete(`/v1/categories/${category.id}`)
        .set('Authorization', `Bearer ${token.access.token}`)
        .expect(httpStatus.OK);
    });
  });
});

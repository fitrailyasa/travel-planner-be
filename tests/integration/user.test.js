const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const prisma = require('../../prisma/client');
const { userOne, admin, insertUsers, userTwo } = require('../fixtures/user.fixture');
const { tokenService } = require('../../src/services');

describe('User Routes', () => {
  let newUser;

  beforeAll(async () => {
    await prisma.user.deleteMany();
    await prisma.token.deleteMany();
  });

  beforeEach(async () => {
    newUser = {
      name: 'tukiplii',
      email: 'kipli@gmail.com',
      password: 'password11$#',
      role: 'user',
    };
    await insertUsers([userOne, admin]);
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.token.deleteMany();
  });

  describe('Authorization', () => {
    test('should return 401 if access token is missing', async () => {
      await request(app).post('/v1/users').send(newUser).expect(httpStatus.UNAUTHORIZED);
      await request(app).get('/v1/users').expect(httpStatus.UNAUTHORIZED);
      await request(app).get(`/v1/users/${userOne.id}`).expect(httpStatus.UNAUTHORIZED);
      await request(app).patch(`/v1/users/${userOne.id}`).send(newUser).expect(httpStatus.UNAUTHORIZED);
      await request(app).delete(`/v1/users/${userOne.id}`).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if user role is not admin', async () => {
      const validAccessToken = await tokenService.generateAuthTokens(userOne);

      await request(app)
        .post('/v1/users')
        .send(userOne)
        .set('Authorization', `Bearer ${validAccessToken.access.token}`)
        .expect(httpStatus.FORBIDDEN);

      await request(app)
        .get('/v1/users')
        .query({ role: userOne.role, page: 1, size: 2 })
        .set('Authorization', `Bearer ${validAccessToken.access.token}`)
        .expect(httpStatus.FORBIDDEN);

      await request(app)
        .get(`/v1/users/${userTwo.id}`)
        .set('Authorization', `Bearer ${validAccessToken.access.token}`)
        .expect(httpStatus.FORBIDDEN);

      await request(app)
        .patch(`/v1/users/${userTwo.id}`)
        .send(newUser)
        .set('Authorization', `Bearer ${validAccessToken.access.token}`)
        .expect(httpStatus.FORBIDDEN);

      await request(app)
        .delete(`/v1/users/${userTwo.id}`)
        .set('Authorization', `Bearer ${validAccessToken.access.token}`)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should allow admin to access user routes', async () => {
      const adminAccessToken = await tokenService.generateAuthTokens(admin);

      await request(app)
        .post('/v1/users')
        .send(newUser)
        .set('Authorization', `Bearer ${adminAccessToken.access.token}`)
        .expect(httpStatus.CREATED);

      await request(app)
        .get('/v1/users')
        .query({ name: userOne.name, role: 'user', page: 1, limit: 2, sortBy: 'email' })
        .set('Authorization', `Bearer ${adminAccessToken.access.token}`)
        .expect(httpStatus.OK);

      await request(app)
        .get(`/v1/users/${userOne.id}`)
        .set('Authorization', `Bearer ${adminAccessToken.access.token}`)
        .expect(httpStatus.OK);

      await request(app)
        .patch(`/v1/users/${userOne.id}`)
        .send({ email: 'zukipli@gmail.com', password: 'zukipli#$11', name: 'zukipli' })
        .set('Authorization', `Bearer ${adminAccessToken.access.token}`)
        .expect(httpStatus.OK);

      await request(app)
        .delete(`/v1/users/${userOne.id}`)
        .set('Authorization', `Bearer ${adminAccessToken.access.token}`)
        .expect(httpStatus.OK);
    });
  });
});

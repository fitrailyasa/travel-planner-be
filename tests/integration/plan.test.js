const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const prisma = require('../../prisma/client');
const { userOne, admin, insertUsers } = require('../fixtures/user.fixture');
const { plan, insertPlans } = require('../fixtures/plan.fixture');
const { tokenService } = require('../../src/services');

describe('plans route', () => {
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

  describe('Travel plans API', () => {
    test('should return 201 and successfully created plans if request data is valid', async () => {
      const token = await tokenService.generateAuthTokens(userOne);
      await request(app)
        .post('/v1/plans')
        .set('Authorization', `Bearer ${token.access.token}`)
        .send({
          name: 'Plan one',
          city: 'Bali',
          travelCompanion: 'Keluarga',
          budget: 10000000,
          travelTheme: 'Petualangan',
          startDate: '2025-06-15',
          endDate: '2025-06-20',
        })
        .expect(httpStatus.CREATED);
    });

    test('should return 200 and successfully get all data plans', async () => {
      const token = await tokenService.generateAuthTokens(userOne);
      await insertPlans(plan);
      await request(app).get('/v1/plans').set('Authorization', `Bearer ${token.access.token}`).expect(httpStatus.OK);
    });

    test('should return 200 and successfully get plan by id', async () => {
      const token = await tokenService.generateAuthTokens(userOne);
      await insertPlans(plan);
      await request(app)
        .get(`/v1/plans/${plan.id}`)
        .set('Authorization', `Bearer ${token.access.token}`)
        .expect(httpStatus.OK);
    });

    test('should return 200 and successfully deleted plan bi id', async () => {
      const token = await tokenService.generateAuthTokens(userOne);
      await insertPlans(plan);
      await request(app)
        .delete(`/v1/plans/${plan.id}`)
        .set('Authorization', `Bearer ${token.access.token}`)
        .expect(httpStatus.OK);
    });
  });
});

const request = require('supertest');
const { faker } = require('@faker-js/faker');
const httpStatus = require('http-status');
const app = require('../../src/app');
const { userOne, userTwo, insertUsers } = require('../fixtures/user.fixture');
const { refreshTokenOne, verifyEmailTokenOne, resetPasswordTokenOne, insertToken } = require('../fixtures/token.fixture');
const prisma = require('../../prisma/client');
const { tokenService } = require('../../src/services');

describe('Auth routes', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.token.deleteMany();
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
    await prisma.token.deleteMany();
  });

  describe('POST /v1/auth/register', () => {
    let newUser;
    beforeEach(() => {
      newUser = {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: 'password1#',
        role: 'user',
      };
    });

    test('should return 201 and successfully register user if request data is ok', async () => {
      const res = await request(app).post('/v1/auth/register/').send(newUser).expect(httpStatus.CREATED);

      const userData = res.body.data;

      expect(userData).toEqual({
        id: expect.anything(),
        name: newUser.name,
        password: expect.anything(),
        email: newUser.email,
        role: newUser.role,
        isEmailVerified: expect.any(Boolean),
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });

      const dbUser = await prisma.user.findUnique({
        where: {
          id: userData.id,
        },
      });

      expect(dbUser).toBeDefined();
      expect(dbUser.password).not.toBe(newUser.password);

      expect(dbUser).toMatchObject({
        id: expect.anything(),
        name: newUser.name,
        password: expect.anything(),
        email: newUser.email,
        role: newUser.role,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });

      expect(res.body.tokens).toEqual({
        access: { token: expect.anything(), expires: expect.anything() },
        refresh: { token: expect.anything(), expires: expect.anything() },
      });
    });

    test('should return 400 error if email is invalid', async () => {
      newUser.email = 'invalid.yahoo.com';

      await request(app).post('/v1/auth/register').send(newUser).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if email is already taken', async () => {
      await insertUsers(userOne);
      newUser.email = userOne.email;

      await request(app).post('/v1/auth/register').send(newUser).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if password length is less than 8 characters', async () => {
      newUser.password = 'pass';

      await request(app).post('/v1/auth/register').send(newUser).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if password does not contain at least 1 letter, number, and special character', async () => {
      newUser.password = 'password';

      await request(app).post('/v1/auth/register').send(newUser).expect(httpStatus.BAD_REQUEST);

      newUser.password = '11111111';

      await request(app).post('/v1/auth/register').send(newUser).expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST v1/auth/send-verification-email', () => {
    test('should retrurn 200 ok if send verification email successfully', async () => {
      await insertUsers(userOne);
      const validAccessToken = await tokenService.generateAuthTokens(userOne);

      const res = await request(app)
        .post('/v1/auth/send-verification-email')
        .set('Authorization', `Bearer ${validAccessToken.access.token}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body.tokens).toStrictEqual(expect.anything());
    });
  });

  describe('POST v1/auth/verify-email', () => {
    test('should return 200 ok if verify email successfully', async () => {
      await insertUsers(userOne);
      const verifyToken = await tokenService.generateVerifyEmailToken(userOne);
      await insertToken(verifyToken);

      await request(app).post('/v1/auth/verify-email').query({ token: verifyToken }).expect(httpStatus.OK);
    });

    test('should return 401 error if token is not valid', async () => {
      await insertUsers(userOne);
      const validAccessToken = await tokenService.generateAuthTokens(userOne);
      await insertToken({ validAccessToken });

      await request(app)
        .post('/v1/auth/verify-email')
        .query({ token: validAccessToken.access.token })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if token is not exists', async () => {
      await insertUsers(userOne);
      const tokens = verifyEmailTokenOne;

      await request(app).post('/v1/auth/verify-email').query(tokens).expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST v1/auth/login', () => {
    test('should return 200 ok if login successfully', async () => {
      await insertUsers({ ...userOne, isEmailVerified: true });
      const login = {
        email: userOne.email,
        password: 'password1#',
      };

      const res = await request(app).post('/v1/auth/login').send(login).expect(httpStatus.OK);

      expect(res.body.data).toEqual({
        id: expect.anything(),
        name: userOne.name,
        email: userOne.email,
        password: expect.anything(),
        role: userOne.role,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
        isEmailVerified: true,
      });

      expect(res.body.tokens).toEqual({
        access: { token: expect.anything(), expires: expect.anything() },
        refresh: { token: expect.anything(), expires: expect.anything() },
      });
    });

    test('should retuen 401 error if wrong email', async () => {
      await insertUsers({ ...userOne, isEmailVerified: true });
      const login = {
        email: userTwo.email,
        password: 'password1#',
      };

      await request(app).post('/v1/auth/login').send(login).expect(httpStatus.UNAUTHORIZED);
    });

    test('should retuen 404 error if wrong password', async () => {
      await insertUsers({ ...userOne, isEmailVerified: true });
      const login = {
        email: userOne.email,
        password: 'wrongPassword11#$',
      };

      await request(app).post('/v1/auth/login').send(login).expect(httpStatus.BAD_REQUEST);
    });

    test('should retuen 401 error if email is not registered', async () => {
      await insertUsers({ ...userOne, isEmailVerified: false });
      const login = {
        email: userOne.email,
        password: 'kiplii#$11',
      };

      await request(app).post('/v1/auth/login').send(login).expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('POST v1/auth/logout', () => {
    test('should return 200 ok if logout is succeesfully', async () => {
      await insertUsers(userOne);
      const refresh = await tokenService.generateAuthTokens(userOne);
      await insertToken({ refresh });

      await request(app).post('/v1/auth/logout').send({ refreshToken: refresh.refresh.token }).expect(httpStatus.OK);
    });

    test('should return 404 not found if token refresh is not found', async () => {
      await insertUsers(userOne);
      const refresh = await tokenService.generateAuthTokens(userOne);
      await insertToken({ refresh });

      await request(app).post('/v1/auth/logout').send({ refreshToken: refresh.access.token }).expect(httpStatus.NOT_FOUND);
    });
  });

  describe('POST v1/auth/refresh-tokens', () => {
    test('should return 200 ok if refresh token is successfully', async () => {
      await insertUsers(userOne);
      const refresh = await tokenService.generateAuthTokens(userOne);
      await insertToken({ refresh });

      const res = await request(app)
        .post('/v1/auth/refresh-tokens')
        .send({ refreshToken: refresh.refresh.token })
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        access: { token: expect.anything(), expires: expect.anything() },
        refresh: { token: expect.anything(), expires: expect.anything() },
      });
    });

    test('should return 404 error if token refresh is not found', async () => {
      await insertUsers(userOne);
      const validAccessToken = await tokenService.generateAuthTokens(userOne);
      await insertToken(validAccessToken);

      await request(app)
        .post('/v1/auth/refresh-token')
        .send({ refreshToken: validAccessToken.access.token })
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('POST v1/auth/forgot-password', () => {
    test('should return 200 ok if forgot passsword is successfully', async () => {
      await insertUsers(userOne);
      await insertToken(resetPasswordTokenOne);
      const sendEmail = { email: userOne.email };

      const res = await request(app).post('/v1/auth/forgot-password').send(sendEmail).expect(httpStatus.OK);
      expect(res.body).toStrictEqual(expect.anything());
    });

    test('should return 404 error if email is not found', async () => {
      await insertUsers(userOne);
      await insertToken(resetPasswordTokenOne);
      const sendEmail = { email: userTwo.email };
      await request(app).post('/v1/auth/forgot-password').send(sendEmail).expect(httpStatus.NOT_FOUND);
    });
  });

  describe('POST v1/auth/reset-password', () => {
    test('should return 200 ok if reset password is successfully', async () => {
      await insertUsers(userOne);
      const reset = await tokenService.generateResetPasswordToken(userOne.email);
      await insertToken(reset);

      const sendPassword = { password: 'password11#@' };

      await request(app).post('/v1/auth/reset-password').query({ token: reset }).send(sendPassword).expect(httpStatus.OK);
    });

    test('should return 401 error if token is not valid', async () => {
      await insertUsers(userOne);
      await insertToken(refreshTokenOne);

      const sendPassword = { password: 'password11#@' };

      await request(app)
        .post('/v1/auth/reset-password')
        .query({ token: refreshTokenOne.token })
        .send(sendPassword)
        .expect(httpStatus.UNAUTHORIZED);
    });
  });
});

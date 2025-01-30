const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');
const ApiError = require('../utils/ApiError');
const prisma = require('../../prisma/client');
const { tokenTypes } = require('../config/tokens');

const register = catchAsync(async (req, res) => {
  const existingUser = await userService.getUserByEmail(req.body.email);

  if (existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  const userCreated = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(userCreated);
  res.status(httpStatus.CREATED).send({ message: 'Register is successfully', data: userCreated, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await userService.getUserByEmail(req.body.email);
  if (!existingUser) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'You dont have an account yet, please register!');
  }

  const user = await authService.login(email, password);
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to login!');
  }

  const existingLoginUser = await prisma.token.findFirst({
    where: { userId: user.id, type: tokenTypes.REFRESH },
    orderBy: { createdAt: 'desc' },
  });

  if (existingLoginUser) {
    await prisma.token.delete({
      where: { id: existingLoginUser.id },
    });
  }
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.OK).send({ message: 'Login is successfully', data: user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.OK).send({ message: 'logout is successfully' });
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.status(httpStatus.OK).send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.OK).send({ resetPasswordToken });
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.OK).send({ message: 'reset password is successfully' });
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res
    .status(httpStatus.OK)
    .send({ message: `Verify email link has been sent to ${req.user.email}`, tokens: verifyEmailToken });
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.OK).send({ message: 'Email has been verification!' });
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
};

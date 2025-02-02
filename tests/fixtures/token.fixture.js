const moment = require('moment');
const config = require('../../src/config/config');
const { tokenTypes } = require('../../src/config/tokens');
const tokenService = require('../../src/services/token.service');
const { userOne } = require('./user.fixture');
const prisma = require('../../prisma/client');

const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
const userOneAccessToken = tokenService.generateToken(userOne.id, accessTokenExpires, tokenTypes.ACCESS);

const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
const userOneRefreshToken = tokenService.generateToken(userOne.id, refreshTokenExpires, tokenTypes.REFRESH);

const resetPasswordTokenExpires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
const userOneResetPasswordToken = tokenService.generateToken(
  userOne.id,
  resetPasswordTokenExpires,
  tokenTypes.RESET_PASSWORD
);

const verifyEmailTokenExpires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
const userOneVerifyEmailToken = tokenService.generateToken(userOne.id, verifyEmailTokenExpires, tokenTypes.VERIFY_EMAIL);

const verifyEmailTokenOne = {
  token: userOneVerifyEmailToken,
  userId: userOne.id,
  expires: verifyEmailTokenExpires,
  type: tokenTypes.VERIFY_EMAIL,
  blacklisted: false,
};

const refreshTokenOne = {
  token: userOneRefreshToken,
  userId: userOne.id,
  expires: refreshTokenExpires,
  type: tokenTypes.REFRESH,
  blacklisted: false,
};

const resetPasswordTokenOne = {
  token: userOneResetPasswordToken,
  userId: userOne.id,
  expires: resetPasswordTokenExpires,
  type: tokenTypes.RESET_PASSWORD,
  blacklisted: false,
};
const insertToken = async (tokens) => {
  try {
    const result = await prisma.token.createMany({
      data: tokens,
      skipDuplicates: true,
    });

    return result;
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  userOneAccessToken,
  // adminAccessToken,
  refreshTokenOne,
  verifyEmailTokenOne,
  insertToken,
  resetPasswordTokenOne,
};

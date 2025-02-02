require('dotenv').config();
global.atob = require('atob');

jest.mock('groq-sdk', () => ({
  Groq: jest.fn(() => ({
    query: jest.fn(),
  })),
}));
jest.mock('./prisma/__mock__/client.js');
jest.setTimeout(30000);

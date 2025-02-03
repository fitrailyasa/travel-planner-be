const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const prisma = require('../../prisma/client');
const ApiError = require('../utils/ApiError');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  const hashPassword = bcrypt.hashSync(userBody.password, 8);

  return prisma.user.create({
    data: {
      ...userBody,
      password: hashPassword,
    },
  });
};

/**
 * Query for users
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (options) => {
  const { page = 1, limit = 5, name = '', role, sortBy } = options;

  const skip = (page - 1) * limit;

  const whereCondition = {
    AND: [
      name
        ? {
            OR: [
              {
                name: {
                  contains: name,
                  mode: 'insensitive',
                },
              },
              {
                email: {
                  contains: name,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}, // Jika name tidak ada, maka tidak menambahkan filter
      role ? { role } : {}, // Jika role tidak ada, maka tidak menambahkan filter
    ].filter((condition) => Object.keys(condition).length > 0), // Menghapus kondisi kosong
  };

  const users = await prisma.user.findMany({
    skip,
    take: limit,
    where: whereCondition.AND.length ? whereCondition : {}, // kalau filter dan option tidak ada tampilin semua
    include: {
      tokens: true,
    },
    orderBy: sortBy ? { [sortBy]: 'asc' } : { name: 'asc' },
  });

  const totalData = await prisma.user.count({ where: whereCondition.AND.length ? whereCondition : {} });
  const totalPage = Math.ceil(totalData / limit);

  return {
    users,
    page,
    totalPage,
    totalData,
  };
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return prisma.user.findFirst({
    where: {
      id,
    },
  });
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email) {
    const isEmailTaken = await getUserByEmail(updateBody.email);
    if (isEmailTaken) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken!');
    }
  }

  const updateUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: updateBody,
  });

  return updateUser;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const deleteUsers = await prisma.user.deleteMany({
    where: {
      id: userId,
    },
  });

  return deleteUsers;
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
};

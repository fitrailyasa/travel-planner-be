const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const planRoute = require('./plan.route');
const categoryRoute = require('./category.route');
const destinationRoute = require('./destination.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/plans',
    route: planRoute,
  },
  {
    path: '/categories',
    route: categoryRoute,
  },
  {
    path: '/destinations',
    route: destinationRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;

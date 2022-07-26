const express = require('express');

// Controllers
const {
	createUser,
	getAllProductsById,
	updateUser,
	deleteUser,
	getUserOrders,
	getOrdersByUserId,
	login
} = require('../controllers/users.controller');

// Middlewares
const {
	createUserValidators, loginValidators, updateUserValidators
} = require('../middlewares/validators.middleware');
const { userExists, orderExists } = require('../middlewares/users.middleware');
const {
	protectSession,
	protectUserAccount,
} = require('../middlewares/auth.middleware');

const usersRouter = express.Router();

usersRouter.post('/', createUserValidators, createUser);

usersRouter.post('/login', loginValidators, login);



usersRouter
	.use(protectSession)
	.get('/me', userExists, getAllProductsById)
	.use('/:id', userExists)
	.get('/orders/:id',orderExists,getOrdersByUserId)
	.get('/orders', getUserOrders)
	.use(protectUserAccount)
	.patch('/:id',updateUserValidators, updateUser)
	.delete('/:id', deleteUser);

module.exports = { usersRouter };

const { body, validationResult } = require('express-validator');

const { AppError } = require('../utils/appError.util');

const checkResult = (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		// Array has errors
		const errorMsgs = errors.array().map(err => err.msg);

		const message = errorMsgs.join('. ');


	}

	next();
};

const createUserValidators = [
	body('username').notEmpty().withMessage('Name cannot be empty'),
	body('email').isEmail().withMessage('Must provide a valid email'),
	body('password')
		.isLength({ min: 8 })
		.withMessage('Password must be at least 8 characters long')
		.isAlphanumeric()
		.withMessage('Password must contain letters and numbers'),
	checkResult,
];


const loginValidators = [
	body('email').isEmail().withMessage('Must provide a valid email'),
	body('password')
		.isLength({ min: 8 })
		.withMessage('Password must be at least 8 characters long')
		.isAlphanumeric()
		.withMessage('Password must contain letters and numbers'),
	checkResult,
];

const createProductValidators = [
	body('title').notEmpty().withMessage('Name cannot be empty'),
	body('description').notEmpty().withMessage('description cannot be empty'),
	body('categoryId').notEmpty().withMessage('categoryId cannot be empty'),
	body('quantity').notEmpty().withMessage('Quantity cannot be empty').isNumeric()
		.withMessage('price needs to be numeric'),
	body('price').notEmpty().withMessage('price cannot be empty').isNumeric()
		.withMessage('price needs to be numeric'),
	checkResult,
];

const createCategoryValidators = [
	body('name').notEmpty().withMessage('Name cannot be empty'),
	checkResult,
];

const updateProductValidators = [
	body('title').notEmpty().withMessage('Name cannot be empty'),
	body('description').notEmpty().withMessage('description cannot be empty'),
	body('quantity').notEmpty().withMessage('Quantity cannot be empty').isNumeric()
		.withMessage('price needs to be numeric'),
	body('price').notEmpty().withMessage('price cannot be empty').isNumeric()
		.withMessage('price needs to be numeric'),
	checkResult,
];

const updateCategoryValidators = [
	body('name').notEmpty().withMessage('Name cannot be empty'),
	checkResult,
];

const updateUserValidators = [
	body('username').notEmpty().withMessage('Name cannot be empty'),
	body('email').isEmail().withMessage('Must provide a valid email'),
	checkResult,
];


module.exports = { createUserValidators, loginValidators, updateUserValidators,
	createProductValidators, createCategoryValidators, updateProductValidators, updateCategoryValidators};

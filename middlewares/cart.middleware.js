// Models
const { Carts } = require('../models/carts.model');

// Utils
const { catchAsync } = require('../utils/catchAsync.util');
const { AppError } = require('../utils/appError.util');

const cartExists = catchAsync(async (req, res, next) => {
	const userId = req.sessionUser.id;

	const cart = await Carts.findOne({ where: { userId:userId, status:'active' } });

	if (!cart) {
		return next(new AppError('Comment not found', 404));
	}

	req.cart = cart;
	next();
});

module.exports = { cartExists };

// Models
const { Users } = require('../models/users.model');
const { Orders } = require('../models/orders.model');

// Utils
const { AppError } = require('../utils/appError.util');
const { catchAsync } = require('../utils/catchAsync.util');

const userExists = catchAsync(async (req, res, next) => {
	let { id } = req.params;
	if(!id || !Number.isInteger(id)){
		id = req.sessionUser.id
	}
	const user = await Users.findOne({ where: { id } });

	if (!user) {
		return next(new AppError('User not found', 404));
	}

	req.user = user;
	next();
});

const orderExists = catchAsync(async (req, res, next) => {
	let { id } = req.params;
	const user = await Orders.findOne({ where: { userId:id, status:'purchased' } });
	if (!user) {
		return next(new AppError('Order not found', 404));
	}

	req.user = user;
	next();
});



module.exports = { userExists, orderExists};

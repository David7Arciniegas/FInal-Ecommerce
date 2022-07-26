// Models
const { Products } = require('../models/products.model');
const { Categories } = require('../models/categories.model');
const { ProductImg } = require('../models/productImg.model');
// Utils
const { AppError } = require('../utils/appError.util');
const { catchAsync } = require('../utils/catchAsync.util');

const productExists = catchAsync(async (req, res, next) => {

	let {id} = req.params;
	const product = await Products.findOne({
		where: { id, status:'active'},
		include: { model: ProductImg},
		
	});

	if (!product) {
		return next(new AppError('Product not found', 404));
	}

	req.product = product;
	next();
});

const categoryExists = catchAsync(async (req, res, next) => {
	let { id } = req.params;
	console.log(id)
	const category = await Categories.findOne({
		where: { id, status:'active'},

	});

	if (!category) {
		return next(new AppError('Category not found', 404));
	}

	req.category = category;
	next();
});

module.exports = { productExists, categoryExists };

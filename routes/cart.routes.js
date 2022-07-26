const express = require('express');

// Controller
const {
	addProductToCart,
    updateCartProduct,
    removeProductFromCart,
    purchaseUserCart,
} = require('../controllers/cart.controller');

// Middlewares
const { cartExists } = require('../middlewares/cart.middleware');
const { protectSession } = require('../middlewares/auth.middleware');

const cartRouter = express.Router();


cartRouter.use(protectSession);


cartRouter
	.post('/add-product', addProductToCart)
	.patch('/update-cart', cartExists, updateCartProduct)
	.delete('/:productId', cartExists, removeProductFromCart)
	.post('/purchase', cartExists, purchaseUserCart)

module.exports = { cartRouter };

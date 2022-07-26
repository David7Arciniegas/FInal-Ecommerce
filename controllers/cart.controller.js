// Models
const {Cart} = require("../models/carts.model");
const {Products} = require("../models/products.model");
const {ProductsInCart} = require("../models/productsInCart.model");
const {Orders} = require("../models/orders.model");


// Utils
const {catchAsync} = require("../utils/catchAsync.util");

// Add Product to Cart
const addProductToCart = catchAsync(async (req, res, next) => {
    const userId = req.sessionUser.id;
    const {productId, quantity} = req.body;
    const {product} = req;



    // check product quantity and body quantity
    if (product.quantity === 5 && quantity > 1)
        return next(new AppError("Cart quantity limit exceeded", 409));

    // get user cart, create otherwise
    let userCart = await Cart.findOne({
        where: {status: "active", userId},
        include: [{model: ProductsInCart}],
    });
    if (!userCart) {
        userCart = await Cart.create({userId, status: 'active'});
    }

    // check if product to add exists in user cart
    const productsInCart_ = userCart.productsInCart.findOne(element => element.id === product.id)

    if (productsInCart_) {
        return next(new AppError("Product has already been added", 404));
    }
    if (productsInCart_.status === "removed") {
        productsInCart_.status = "active"
        productsInCart_.quantity = quantity
    }

    // push element to the cart
    userCart.productsInCart.push(product)
    // push query

    const fullCart = await Cart.update(userCart);


    res.status(201).json({
        status: "success",
        fullCart,
    });
});

// Update Cart Product

const updateCartProduct = catchAsync(async (req, res, next) => {
    const userId = req.sessionUser.id;
    const {productId, newQty} = req.body;
    const {product} = req;


    // get user cart, error otherwise
    let userCart = await Cart.findOne({
        where: {status: "active", userId},
        include: [{model: ProductsInCart}],
    });
    if (!userCart) {
        return next(new AppError("There are no carts of this user", 404));
    }

    // check product quantity and validate
    if (product.quantity === 5 && newQty > 1)
        return next(new AppError("Cart quantity limit exceeded", 409));



    // check index where the product is stored, and update quantity
    const productIndexInCart = userCart.productsInCart.findIndex(element => element.id === product.id)
    product.quantity = newQty
    // if newQty is 0, update to remove
    if (newQty===0){
        product.update({status:'removed'})
    }
    userCart.productsInCart[productIndexInCart] = product

    //push query

    const fullCart = await Cart.update(userCart);

    res.status(201).json({
        status: "success",
        fullCart,
    });
});

const removeProductFromCart = catchAsync(async (req, res, next) => {
    const userId = req.sessionUser.id;
    const {product} = req;


    // get user cart, error otherwise
    let userCart = await Cart.findOne({
        where: {status: "active", userId},
        include: [{model: ProductsInCart}],
    });
    if (!userCart) {
        return next(new AppError("There are no carts of this user", 404));
    }

    // check index where the product is stored, and update quantity
    const productIndexInCart = userCart.productsInCart.findIndex(element => element.id === product.id)
    userCart.productsInCart[productIndexInCart] = {...quantity=0, status:'removed'}

    //push query

    const fullCart = await Cart.update(userCart);

    res.status(201).json({
        status: "success",
        fullCart,
    });
});


const purchaseUserCart = catchAsync(async (req, res, next) => {
    const userId = req.sessionUser.id;

    // get user cart, error otherwise
    let userCart = await Cart.findOne({
        where: {status: "active", userId},
        include: [{model: ProductsInCart}],
    });
    if (!userCart) {
        return next(new AppError("There are no carts of this user", 404));
    }

    //calculate total order
    let totalPrice = 0
    userCart.productsInCart = userCart.productsInCart.map( product => {
         totalPrice += product.price * product.quantity
         let actualProduct = Products.findOne({
             where: {status: "active", id:product.id}
         })
         actualProduct.update({quantity:actualProduct.quantity - product.quantity})
        product.status = 'purchased'
    })

    // fill order

    const order = await Orders.create({userId, cartId:userCart.id, totalPrice})

    res.status(201).json({
        status: "success",
        order,
    });
});



module.exports = {
    addProductToCart,
    updateCartProduct,
    removeProductFromCart,
    purchaseUserCart,
  
};

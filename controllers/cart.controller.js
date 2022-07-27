// Models
const {Carts} = require("../models/carts.model");
const {Products} = require("../models/products.model");
const {ProductsInCart} = require("../models/productsInCart.model");
const {Orders} = require("../models/orders.model");


// Utils
const {catchAsync} = require("../utils/catchAsync.util");

// Add Product to Cart

const addProductToCart = catchAsync(async (req, res, next) => {
    const { sessionUser } = req;
    const { productId, quantity } = req.body;
  
    // Validate input qty
    const product = await Products.findOne({
      where: { id: productId, status: 'active' },
    });
  
    if (!product) {
      return next(new AppError('Invalid product', 404));
    } else if (quantity > product.quantity) {
      return next(
        new AppError(
          `This product only has ${product.quantity} items available`,
          400
        )
      );
    }
  
    // Check if cart exists
    const cart = await Carts.findOne({
      where: { status: 'active', userId: sessionUser.id },
    });
  
    if (!cart) {
      // Create new cart for user
      const newCart = await Carts.create({ userId: sessionUser.id });
  
      // Add product to newly created cart
      await ProductsInCart.create({
        cartId: newCart.id,
        productId,
        quantity,
      });
    } else {
      // Cart already exists
      // Check if product already exists in cart
      const productExists = await ProductsInCart.findOne({
        where: { cartId: cart.id, productId },
      });
  
      if (productExists) {
        return next(new AppError('Product is already in the cart', 400));
      }
  
      await ProductsInCart.create({ cartId: cart.id, productId, quantity });
    }
  
    res.status(200).json({ status: 'success' });
  });


// Update Cart Product

const updateCartProduct = catchAsync(async (req, res, next) => {
    const userId = req.sessionUser.id;
    const {productId, newQty} = req.body;
    const {product} = req;


    // get user cart, error otherwise
    let userCart = await Carts.findOne({
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

    const fullCart = await Carts.update(userCart);

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

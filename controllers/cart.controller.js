// Models
const { Carts } = require("../models/carts.model");
const { Products } = require("../models/products.model");
const { ProductsInCart } = require("../models/productsInCart.model");
const { Orders } = require("../models/orders.model");
const { AppError } = require("../utils/appError.util");

// Utils
const { catchAsync } = require("../utils/catchAsync.util");
const { Email } = require("../utils/email.util");

// Get User Cart

const getUserCart = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const cart = await Carts.findOne({
    where: { userId: sessionUser.id, status: "active" },
    include: [
      {
        model: ProductsInCart,
        required: false,
        where: { status: "active" },
        include: { model: Products },
      },
    ],
  });

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  res.status(200).json({ status: "success", cart });
});

// Add Product to Cart

const addProductToCart = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { productId, quantity } = req.body;

  // Validate input qty
  const product = await Products.findOne({
    where: { id: productId, status: "active" },
  });

  if (!product) {
    return next(new AppError("Invalid product", 404));
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
    where: { status: "active", userId: sessionUser.id },
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
      return next(new AppError("Product is already in the cart", 400));
    }

    await ProductsInCart.create({ cartId: cart.id, productId, quantity });
  }

  res.status(200).json({ status: "success" });
});

// Update Cart Product

const updateCartProduct = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { productId, newQty } = req.body;

  // Validate input qty
  const product = await ProductsInCart.findOne({
    where: { id: productId, status: "active" },
  });

  if (!product) {
    return next(new AppError("Invalid product", 404));
  } else if (newQty > product.quantity) {
    return next(
      new AppError(
        `This product only has ${product.quantity} items available`,
        400
      )
    );
  }

  const cart = await Carts.findOne({
    where: { userId: sessionUser.id, status: "active" },
  });

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  const productInCart = await ProductsInCart.findOne({
    cartId: cart.id,
    productId,
    status: "active",
  });

  if (!productInCart) {
    return next(new AppError("Product not found in cart", 404));
  }

  if (newQty <= 0) {
    await productInCart.update({ quantity: 0, status: "removed" });
  } else if (newQty > 0) {
    await productInCart.update({ quantity: newQty });
  }

  res.status(200).json({ status: "success" });
});

const removeProductFromCart = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { productId } = req.params;

  const cart = await Carts.findOne({
    where: { userId: sessionUser.id, status: "active" },
  });

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  const productInCart = await ProductsInCart.findOne({
    cartId: cart.id,
    productId,
    status: "active",
  });

  if (!productInCart) {
    return next(new AppError("Product not found in cart", 404));
  }

  await productInCart.update({ status: "removed", quantity: 0 });

  res.status(200).json({ status: "success" });
});

const purchaseCart = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  let cart = await Carts.findOne({
    where: { userId: sessionUser.id, status: "active" },
    include: [
      {
        model: ProductsInCart,
        required: false,
        where: { status: "active" },
        include: { model: Products },
      },
    ],
  });

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  let totalPrice = 0;

  cart = await Carts.findOne({
    where: { userId: sessionUser.id, status: "active" },
    include: [
      {
        model: ProductsInCart,
        required: false,
        where: { status: "active" },
        include: { model: Products },
      },
    ],
  });
  let myProducts = [];
  const productsPurchasedPromises = cart.productsInCarts.map(
    async (productInCarts) => {
      const newQty = productInCarts.product.quantity - productInCarts.quantity;

      const productPrice =
        productInCarts.quantity * +productInCarts.product.price;

      totalPrice += productPrice;
      myProducts.push({
        title: productInCarts.product.title,
        price: productInCarts.product.price,
        quantity: productInCarts.product.quantity,
      });
      await productInCarts.product.update({ quantity: newQty });
      return await productInCarts.update({ status: "purchased" });
    }
  );

  await Promise.all(productsPurchasedPromises);

  const newOrder = await Orders.create({
    userId: sessionUser.id,
    cartId: cart.id,
    totalPrice,
  });
  
  // Send new order email
  await new Email(sessionUser.email).sendNewOrder(totalPrice, myProducts);
  res.status(200).json({ status: "success", newOrder });
});

module.exports = {
  addProductToCart,
  updateCartProduct,
  removeProductFromCart,
  purchaseCart,
  getUserCart,
};

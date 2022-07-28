const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// Models
const { Users } = require("../models/users.model");
const { Orders } = require("../models/orders.model");
const { Products } = require("../models/products.model");
const { Carts } = require("../models/carts.model");

// Utils
const { catchAsync } = require("../utils/catchAsync.util");
const { AppError } = require("../utils/appError.util");
const { Email } = require("../utils/email.util");

// Gen secrets for JWT, require('crypto').randomBytes(64).toString('hex')

dotenv.config({ path: "./config.env" });


// endpoint POST /
const createUser = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const hashPassword = await bcrypt.hash(password, salt);

  const newUser = await Users.create({
    username,
    email,
    password: hashPassword,
  });

  // Remove password from response
  newUser.password = undefined;

  // Send welcome email
  await new Email(email).sendWelcome(username);

  res.status(201).json({
    status: "success",
    newUser,
  });
});

// endpoint GET /me
const getAllProductsById = catchAsync(async (req, res, next) => {
    const userId = req.sessionUser.id;
    const products = await Products.findAll({
        where: { userId },
    });
    if (!products) {
        return next(new AppError("No products found for that user", 404));
    }
    res.status(200).json({
        status: "success",
        products,
    });
});


//ENDPOINT PATCH
const updateUser = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { username, email } = req.body;

  await user.update({ username, email });

  res.status(204).json({ status: "success" });
});

// ENDPOINT DELETE
const deleteUser = catchAsync(async (req, res, next) => {
  const { user } = req;

  // await user.destroy();
  await user.update({ status: "deleted" });

  res.status(204).json({ status: "success" });
});


const getUserOrders = catchAsync(async (req, res, next) => {
    const userId = req.sessionUser.id;
    const orders = await Orders.findAll({
        where: { userId },
        include: [{model: Carts}],
    });

    if (!orders) {
        return next(new AppError("No orders found for that user", 404));
    }

    res.status(200).json({
        status: "success",
        orders,
    });
});

const getOrdersByUserId = catchAsync(async (req, res, next) => {
    const userId = req.sessionUser.id
    const orders = await Orders.findAll({
        where: { userId,
            status: 'active' },
        include: [{ model: Carts }],
    });

    if (!orders) {
        return res.status(404).json({
            status: "error",
            message: "Order not found",
        });
    }

    res.status(200).json({
        status: 'success',
        data: { orders },
    });
});

//ENDPOINT Login
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // Validate credentials (email)
  const user = await Users.findOne({
    where: {
      email,
      status: "active",
    },
  });

  if (!user) {
    return next(new AppError("Credentials invalid", 400));
  }

  // Validate password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return next(new AppError("Credentials invalid", 400));
  }

  // Generate JWT (JsonWebToken) ->
  const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  // Send response
  res.status(200).json({
    status: "success",
    token,
  });
});

module.exports = {
    createUser,
    getAllProductsById,
    updateUser,
    deleteUser,
    getUserOrders,
    getOrdersByUserId,
    login
};

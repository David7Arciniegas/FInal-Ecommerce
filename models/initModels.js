// Models
const { Users } = require("./users.model");
const { Carts } = require("./carts.model");
const { Categories } = require("./categories.model");
const { Orders } = require("./orders.model");
const { ProductsInCart } = require("./productsInCart.model");
const { ProductImgs } = require("./productImgs.model");
const { Products } = require("./products.model");
const initModels = () => {
  // 1 User <----> M Orders
  Users.hasMany(Orders, { foreignKey: "userId" });
  Orders.belongsTo(Users);

  // 1 Users <----> 1 Carts
  Users.belongsTo(Carts, { foreignKey: "userId" });
  Carts.belongsTo(Users);

  // 1 Users <----> M Products
  Users.hasMany(Products, { foreignKey: "userId" });
  Products.belongsTo(Users);

  // 1 Orders <----> 1 Carts
  Orders.belongsTo(Carts, { foreignKey: "Id" });
  Carts.belongsTo(Orders);

  // 1 Products <----> M ProductImgs
  Products.hasMany(ProductImgs, { foreignKey: "productId" });
  ProductImgs.belongsTo(Products);

  // 1 Products <----> 1 ProductsInCart
  Products.belongsTo(ProductsInCart, { foreignKey: "productId" });
  ProductsInCart.belongsTo(Products);

  // 1 Products <----> M Categories
  Products.belongsTo(Categories, { foreignKey: "Id" });
  Categories.belongsTo(Products);

  // 1 Carts <----> M ProductsInCart
  Carts.hasMany(ProductsInCart, { foreignKey: "cartId" });
  ProductsInCart.belongsTo(Carts);
};

module.exports = { initModels };

const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");

// Models
const { Products } = require("../models/products.model");
const { ProductImg } = require("../models/productImg.model");
//const { Users } = require("../models/users.model");
const { Categories } = require("../models/categories.model");

// Utils
const { catchAsync } = require("../utils/catchAsync.util");
//const { Email } = require("../utils/email.util");
const { storage } = require("../utils/firebase.util");

//POST Createproduct
const createProduct = catchAsync(async (req, res, next) => {
  const { title, description, price, categoryId, quantity } = req.body;
  const userId = req.sessionUser.id;

  const newProduct = await Products.create({
    userId,
    title,
    description,
    price,
    categoryId,
    quantity,
  });

  if (req.files.length > 0) {
		const filesPromises = req.files.map(async file => {
			const imgRef = ref(storage, `products/${Date.now()}_${file.originalname}`);
			const imgRes = await uploadBytes(imgRef, file.buffer);

			return await ProductImg.create({
				productId: newProduct.id,
				imgUrl: imgRes.metadata.fullPath,
			});
		});

		await Promise.all(filesPromises);
	}


  res.status(201).json({
    status: "success",
    newProduct,
  });
});

//GET product
const getAllProducts = catchAsync(async (req, res, next) => {
  // Include all products
  const products = await Products.findAll({
    where: { status: "active" },
  });

  if (!products) {
    return next(new AppError("No products found for that user", 404));
  }
  res.status(200).json({
    status: "success",
    products,
  });
});

//GET product by Id
const getProductById = catchAsync(async (req, res, next) => {
  const {id} = req.params;
  console.log(id)
  const product = await Products.findOne({
    where: { id , status:'active'},
  });

  if (!product) {
    return res.status(404).json({
      status: "error",
      message: "Product not found",
    });
  }

  res.status(200).json({
    status: "success",
    product,
  });
});
// PATCH product
const updateProduct = catchAsync(async (req, res, next) => {
  const { product } = req;
  const { title, description, price, quantity } = req.body;
  const userId = req.sessionUser.id;
  if(userId === product.userId){
    await product.update({ title, description, price, quantity });
    res.status(204).json({ status: "success" });
  } else {
    res.status(403).json({ status: "Product can only be modified by its owner" })
  }

});
// DELETE product
const deleteProduct = catchAsync(async (req, res, next) => {
  const { product } = req;

  const userId = req.sessionUser.id;
  if(userId === product.userId){
    await product.update({ status: "deleted" });
    res.status(204).json({ status: "success" });
  } else {
    res.status(403).json({ status: "Product can only be modified by its owner" })
  }
});
//GET categories
const getAllCategories = catchAsync(async (req, res, next) => {
  console.log('aqui')
  const categories = await Categories.findAll({
    where: {
      status: "active",
    },
  });

  if (!categories) {
    return next(new AppError("No categories found", 404));
  }

  res.status(200).json({
    status: "success",
    categories,
  });
});
//POST Category
const createCategory = catchAsync(async (req, res, next) => {
  const { categoryId, name } = req.body;

  const newCategory = await Categories.create({
    categoryId,
    name,
  });

  res.status(200).json({
    status: "success",
    newCategory,
  });
});
//PATCH Category
const updateCategory = catchAsync(async (req, res, next) => {
  const { category } = req;

  await category.update({ category });

  res.status(204).json({ status: "success" });
});

module.exports = {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getAllCategories,
  createCategory,
  updateCategory,
};

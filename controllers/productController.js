const Product = require('../models/Product');
const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

const getAllProducts = async (req, res) => {
  const products = await Product.find({});
  res.status(StatusCodes.OK).json({products, count: products.length});
};

const getSingleProduct = async (req, res) => {
  const product = await Product.findOne({_id: req.params.id});
  
  if(!product){
    throw new CustomError.NotFoundError(`No product exists with id ${req.params.id}`);
  }

  res.status(StatusCodes.OK).json({product});
};

const createProduct = async (req, res) => {
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);

  res.status(StatusCodes.CREATED).json({product});
};

const updateProduct = async (req, res) => {
  const product = await Product.findOneAndUpdate(
    {_id: req.params.id},
    req.body,
    {new: true, runValidators: true}
  );
  
  if(!product){
    throw new CustomError.NotFoundError(`No product exists with id ${req.params.id}`);
  }

  res.status(StatusCodes.OK).json({product});
};

const deleteProduct = async (req, res) => {
  const product = await Product.findOneAndDelete({_id: req.params.id});
  
  if(!product){
    throw new CustomError.NotFoundError(`No product exists with id ${req.params.id}`);
  }

  res.status(StatusCodes.OK).send('Product succesfully deleted');
};

const uploadImage = async (req, res) => {
  if(!req.files){
    throw new CustomError.BadRequestError('No file uploaded');
  }

  const productImage = req.files.image;
  if(!productImage.mimetype.startsWith('image')){
    throw new CustomError.BadRequestError('Please upload an image file');
  }

  const maxSize = 1024 * 1024;
  if(productImage.size > maxSize){
    throw new CustomError.BadRequestError('Image must be smaller then 1MB');
  }

  const result = await cloudinary.uploader.upload(
    productImage.tempFilePath,
    {
      use_filename: true,
      folder: "ecommerce-api"
    }
  );

  fs.unlinkSync(productImage.tempFilePath);

  res.status(StatusCodes.OK).json({image: {src: result.secure_url}});
};

module.exports = {
  getAllProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage
};
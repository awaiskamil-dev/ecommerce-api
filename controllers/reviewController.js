const Product = require('../models/Product');
const Review = require('../models/Review');
const CustomError = require('../errors');
const { BadRequestError } = require('../errors');
const { StatusCodes } = require('http-status-codes');
const {checkPermissions} = require('../utils');

const getAllReviews = async (req, res) => {
  const reviews = await Review.find({}).populate({
    path: 'product',
    select: 'name company price'
  });
  res.status(StatusCodes.OK).json({reviews, count: reviews.length});
};

const getSingleReview = async (req, res) => {
  const {id} = req.params;

  const review = await Review.findOne({_id: id});
  if(!review){
    throw new CustomError.NotFoundError(`No review found with id ${id}`);
  }

  res.status(StatusCodes.OK).json({review});
};

const createReview = async (req, res) => {
  const {product: productId} = req.body;

  const isValidProduct = await Product.findOne({_id: productId});
  if(!isValidProduct){
    throw new CustomError.NotFoundError(`No product exists with product id ${productId}`);
  }

  const alreadySubmitted = await Review.findOne({
    product: productId, 
    user: req.user.userId
  });
  if(alreadySubmitted){
    throw new CustomError.BadRequestError('This user has already submitted a review for this product');
  }

  req.body.user = req.user.userId;
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({review});
};

const updateReview = async (req, res) => {
  const {id} = req.params;

  const review = await Review.findOneAndUpdate(
    {_id: id},
    req.body,
    {new: true, runValidators: true}
  );
  if(!review){
    throw new CustomError.NotFoundError(`No review found with id ${id}`);
  }

  res.status(StatusCodes.OK).json({review});
};

const deleteReview = async (req, res) => {
  const {id} = req.params;

  const review = await Review.findOne({_id: id});
  if(!review){
    throw new CustomError.NotFoundError(`No review found with id ${id}`);
  }

  checkPermissions(req.user, review.user);
  await review.remove();
  res.status(StatusCodes.OK).send('Review deleted succesfully');
};

const getSingleProductReviews = async (req, res) => {
  const {id: productId} = req.params;

  const reviews = await Review.find({product: productId});
  res.status(StatusCodes.OK).json({reviews, count: reviews.length});
};

module.exports = {
  getAllReviews,
  getSingleReview,
  createReview,
  updateReview,
  deleteReview,
  getSingleProductReviews
};
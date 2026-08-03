const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions
} = require('../middleware/authentication');
const {
  getAllProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage
} = require('../controllers/productController');
const {getSingleProductReviews} = require('../controllers/reviewController');

router.route('/')
  .get(authenticateUser, getAllProducts)
  .post(authenticateUser, authorizePermissions('admin'), createProduct);
router.route('/:id')
  .get(authenticateUser, getSingleProduct)
  .patch(authenticateUser, authorizePermissions('admin'), updateProduct)
  .delete(authenticateUser, authorizePermissions('admin'), deleteProduct);
router.route('/uploadImage')
  .post(authenticateUser, authorizePermissions('admin'), uploadImage);
router.route('/:id/reviews').get(getSingleProductReviews);

module.exports = router;
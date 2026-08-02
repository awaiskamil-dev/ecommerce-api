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

router.route('/')
  .get(authenticateUser, getAllProducts)
  .post(authenticateUser, authorizePermissions, createProduct);
router.route('/:id')
  .get(authenticateUser, getSingleProduct)
  .patch(authenticateUser, authorizePermissions, updateProduct)
  .delete(authenticateUser, authorizePermissions, deleteProduct);
router.route('/uploadImage')
  .post(authenticateUser, authorizePermissions, uploadImage);

module.exports = router;
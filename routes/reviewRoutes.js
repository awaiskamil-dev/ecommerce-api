const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions
} = require('../middleware/authentication');
const {
  getAllReviews,
  getSingleReview,
  createReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');

router.route('/')
  .get(authenticateUser, getAllReviews)
  .post(authenticateUser, authorizePermissions('admin'), createReview);
router.route('/:id')
  .get(authenticateUser, getSingleReview)
  .patch(authenticateUser, authorizePermissions('admin'), updateReview)
  .delete(authenticateUser, authorizePermissions('admin'), deleteReview);

module.exports = router;
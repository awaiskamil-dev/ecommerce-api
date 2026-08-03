const getAllReviews = async (req, res) => {
  res.send('get all reviews');
};

const getSingleReview = async (req, res) => {
  res.send('get single review');
};

const createReview = async (req, res) => {
  res.send('creating a review');
};

const updateReview = async (req, res) => {
  res.send('updating review');
};

const deleteReview = async (req, res) => {
  res.send('deleting review');
};

module.exports = {
  getAllReviews,
  getSingleReview,
  createReview,
  updateReview,
  deleteReview
};
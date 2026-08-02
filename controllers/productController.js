const getAllProducts = async (req, res) => {
  res.send('getting all products');
};

const getSingleProduct = async (req, res) => {
  res.send('getting a single product');
};

const createProduct = async (req, res) => {
  res.send('creating a product');
};

const updateProduct = async (req, res) => {
  res.send('updating a product');
};

const deleteProduct = async (req, res) => {
  res.send('deleting a product');
};

const uploadImage = async (req, res) => {
  res.send('uploading an image');
};

module.exports = {
  getAllProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage
};
const getAllOrders = async (req, res) => {
  res.send('getting all orders');
};

const getSingleOrder = async (req, res) => {
  res.send('getting a single order');
};

const getCurrentUserOrders = async (req, res) => {
  res.send('getting current user orders');
};

const createOrder = async (req, res) => {
  res.send('creating an order');
};

const updateOrder = async (req, res) => {
  res.send('updating an order');
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder
};
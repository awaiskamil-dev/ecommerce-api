const Order = require('../models/Order');
const Product = require('../models/Product');
const CustomError = require('../errors');
const {StatusCodes} = require('http-status-codes');
const chechPermissions = require('../utils/checkPermissions');

const fakeStripeAPI = async ({amount, currency}) => {
  const client_secret = 'somerandomvalue';
  return {client_secret, amount};
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({orders, count: orders.length});
};

const getSingleOrder = async (req, res) => {
  const {id: orderId} = req.params;

  const order = await Order.findOne({_id: orderId});
  if(!order){
    throw new CustomError.NotFoundError(`No order exists with id ${orderId}`);
  }

  chechPermissions(req.user, order.user);
  res.status(StatusCodes.OK).json({order});
};

const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({user: req.user.userId});
  res.status(StatusCodes.OK).json({orders, count: orders.length});
};

const createOrder = async (req, res) => {
  const {items: cartItems, tax, shippingFee} = req.body;

  if(!cartItems || cartItems.length < 1){
    throw new CustomError.BadRequestError('No cart items provided');
  }
  if(!tax || !shippingFee){
    throw new CustomError.BadRequestError('Please provide both tax and shipping fee');
  }

  let orderItems = [];
  let subtotal = 0;

  for(const item of cartItems){
    const dbProduct = await Product.findOne({_id: item.product});
    if(!dbProduct){
      throw new CustomError.NotFoundError(`No product with id ${item.product}`);
    }

    const {name, price, image, _id} = dbProduct;
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id
    };
    orderItems = [...orderItems, singleOrderItem];

    subtotal += price * item.amount;
  };

  const total = tax + shippingFee + subtotal;
  
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: 'usd'
  });

  const order = await Order.create({
    tax,
    shippingFee,
    subtotal,
    total,
    orderItems,
    user: req.user.userId,
    clientSecret: paymentIntent.client_secret,
  });

  res.status(StatusCodes.CREATED).json({order, clientSecret: order.clientSecret});
};

const updateOrder = async (req, res) => {
  const {id: orderId} = req.params;
  const {paymentIntentId} = req.body;

  const order = await Order.findOne({_id: orderId});
  if(!order){
    throw new CustomError.NotFoundError(`No order exists with id ${orderId}`);
  }

  chechPermissions(req.user, order.user);
  order.paymentIntentId = paymentIntentId;
  order.status = 'paid';
  await order.save();

  res.status(StatusCodes.OK).json({order});
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder
};
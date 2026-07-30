const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');
const CustomError = require('../errors');
const {createTokenUser, attachCookiesToResponse} = require('../utils');
const { token } = require('morgan');

const register = async (req, res) => {
  const {name, email, password} = req.body;
  
  const emailAlreadyExists = await User.findOne({email});
  if(emailAlreadyExists){
    throw new CustomError.BadRequestError('This email already exists');
  }

  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? 'admin' : 'user';

  const user = await User.create({name, email, password, role});
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({res, user: tokenUser});

  res.status(StatusCodes.CREATED).json({user: tokenUser});
};

const login = async (req, res) => {
  res.send('Login route');
};

const logout = async (req, res) => {
  res.send('Logout route');
};

module.exports = {
  register,
  login,
  logout
};
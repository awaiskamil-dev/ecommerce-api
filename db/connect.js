const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');

const connectDB = (url) => {
  return mongoose.connect(url);
};

module.exports = connectDB;

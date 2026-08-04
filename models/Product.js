const mongoose = require('mongoose');
const Product = require('../models/Product');

const ProductSchema = new mongoose.Schema({
  name:{
    type: String,
    trim: true,
    required: [true, 'Please provide product name'],
    maxlength: [100, 'Name can not be more than 100 characters'],
  },
  price:{
    type: Number,
    required: [true, 'Please provide product price'],
    default: 0,
  },
  description:{
    type: String,
    required: [true, 'Please provide product description'],
    maxlength: [1000, 'Description cannot be more then 1000 characters'],
  },
  image:{
    type: String,
    default: 'https://res.cloudinary.com/in26esa9/image/upload/v1785761745/ecommerce-api/tmp-2-1785761740042_oqcwox.jpg',
  },
  category:{
    type: String,
    required: [true, 'Please provide product category'],
    enum: ['office', 'kitchen', 'bedroom']
  },
  company:{
    type: String,
    required: [true, 'Please provide company'],
    enum: {
      values: ['ikea', 'liddy', 'marcos'],
      message: '{VALUE} is not supported'
    }
  },
  colors:{
    type: [String],
    default: ['#222'],
    required: true,
  },
  featured:{
    type: Boolean,
    default: false,
  },
  freeShipping:{
    type: Boolean,
    default: false,
  },
  inventory:{
    type: Number,
    required: true,
    default: 15,
  },
  averageRating:{
    type: Number,
    default: 0,
  },
  numOfReviews:{
    type: Number,
    default: 0,
  },
  user:{
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },
},
{timestamps: true, toJSON: {virtuals: true}, toObject: {virtuals: true}}
);

ProductSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
  justOne: false
});

ProductSchema.pre('remove', async function (next){
  await this.model('Review').deleteMany({product: this._id});
});

module.exports = mongoose.model('Product', ProductSchema);
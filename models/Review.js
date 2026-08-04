const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please provide rating'],
  },
  title: {
    type: String,
    trim: true,
    required: [true, 'Please provide title'],
    maxlength: 100,
  },
  comment: {
    type: String,
    required: [true, 'Please provide review text'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true,
  },
},
{timestamps: true}
);

ReviewSchema.index({product: 1, user: 1}, {unique: true}); // compound unique index, allows only one instance of same product and user in a collection

ReviewSchema.statics.calculateAverageRating = async function (productId) { // statics is a function for model
  const result = await this.aggregate([ // aggregate runs an aggregation pipeline,  method is a function for document                                 
    { $match: { product: productId } }, // first step of pipeline is to filter out results
    {
      $group: {                         // second step is to group them together into a summary document
        _id: null,                      // every group needs a common _id, null means create one big group that survived filtering
        averageRating: { $avg: '$rating' }, // calculates avg from rating field of review
        numOfReviews: { $sum: 1 },      // this counts +1 for every document in the group
      },
    },
  ]);

  try {
    await this.model('Product').findOneAndUpdate(  // we update average rating and numofReviews field in Product with this info
      { _id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0), // result is an array, and in this case with one group, result[0]
        numOfReviews: result[0]?.numOfReviews || 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

ReviewSchema.post('save', async function(){
  await this.constructor.calculateAverageRating(this.product); // this.constructoer refers to the Model
});

ReviewSchema.post('remove', async function(){
  await this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model('Review', ReviewSchema);
require('dotenv').config();
require('express-async-errors');

const express = require('express');
const app = express();

const cloudinary = require('cloudinary').v2;
const fileUpload = require('express-fileupload');

const errorHandler = require('./middleware/error-handler');
const notFound = require('./middleware/not-found');

const connectDB = require('./db/connect');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const productRouter = require('./routes/productRoutes');

//middleware
app.use(morgan('dev'));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.json());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: './tmp/'
}));

//routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);

app.use(errorHandler);
app.use(notFound);

const port = process.env.PORT;

const start = async () => {
  try{
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    }); 
  }catch(error){
    console.log(error);
  }
};

start();
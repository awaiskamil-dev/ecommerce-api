require('dotenv').config();
require('express-async-errors');

const express = require('express');
const app = express();

const errorHandler = require('./middleware/error-handler');
const notFound = require('./middleware/not-found');

const connectDB = require('./db/connect');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');

//middleware
app.use(morgan('dev'));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.json());

//routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);

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
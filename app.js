require('dotenv').config();

const express = require('express');
const app = express();

const errorHandler = require('./middleware/error-handler');
const notFound = require('./middleware/not-found');

const connectDB = require('./db/connect');

//middleware
app.use(express.json());

//routes
app.get('/', (req, res) => {
  res.send('<h1>Home Page</h1>');
})

app.use(errorHandler);
app.use(notFound);

const port = process.env.PORT || 5000 ;

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
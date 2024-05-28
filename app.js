require("dotenv").config();
require("express-async-errors");

//extra security packages
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

const express = require("express");
const app = express();

app.set("trust proxy", 1);
app.use(rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200 // limit each IP to 200 requests per windowMs
}))
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());

//connect to db
const connectDB = require("./db/connnect");

// routers
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const galleryRouter = require("./routes/gallery");
const mcqRouter = require("./routes/mcqs");
const fitgRouter = require("./routes/fitg");
const essayqsRouter = require("./routes/essayqs");
const updateRouter = require("./routes/updatestudentproperties");
const questionsRouter = require("./routes/questions");

// routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/dashboard', profileRouter);
app.use('/api/v1/gallery', galleryRouter);
app.use('/api/v1/mcq', mcqRouter);
app.use('/api/v1/fitg', fitgRouter);
app.use('/api/v1/update', updateRouter);
app.use('/api/v1/essayqs', essayqsRouter);
app.use('/api/v1/questions', questionsRouter);



const port = process.env.PORT || 8800;

const startConnection = async () => {
  try {
    const isConnectionSuccessful = await connectDB(process.env.MONGO_URI);

    if (isConnectionSuccessful) {
      app.listen(
        port,
        console.log(
          `Connection to the Database Successful. Server is listening on port ${port}`
        )
      );
    } else {
      console.log("Connection Failed");
    }
  } catch (error) {
    console.log(error);
  }
};

startConnection();


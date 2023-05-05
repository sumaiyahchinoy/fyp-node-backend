const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const createError = require("http-errors");
require("dotenv").config(); // to import environment variables
require("./helpers/init_mongodb");

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoute = require("./routes/auth.route");

app.use("/auth", authRoute);

app.use(async (req, res, next) => {
  next(createError.NotFound());
  // without next(), the browser will hang. next tells the express object to move on
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      requestedURL: req.url,
      status: err.status || 500,
      message: err.message,
    },
  });
  next();
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log("listening on port 3002");
});

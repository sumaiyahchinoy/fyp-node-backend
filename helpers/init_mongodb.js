require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(
  `mongodb+srv://er_dashboard:${process.env.database_password}@cluster0.2r7vtwc.mongodb.net/?retryWrites=true&w=majority`
);

// some callbacks for connection/disconnection with mongooose

mongoose.connection.on("connected", () => {
  console.log("mongoose connected to database");
});

mongoose.connection.on("error", (err) => {
  console.log(err.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("disconnected from MongoDB");
});

// disconnect mongoose after pressing Ctrl+C

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});

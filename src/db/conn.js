const mongoose = require("mongoose");
const validator = require("validator");

mongoose.set("strictQuery", true);

mongoose
  .connect("mongodb://127.0.0.1:27017/internship")
  .then(() => console.log("Connection  Successful with database"))
  .catch((err) => console.log(err));
const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  posts:[{
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
  
});

//Start with capital and shd be Singular
const AllUser = new mongoose.model("AllUser", userSchema);

module.exports =  AllUser;

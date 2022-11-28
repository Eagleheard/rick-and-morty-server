import mongoose from "mongoose";
import pkg from "mongoose";

const { Schema } = pkg;

const UserSchema = new Schema({
  email: {
    type: String,
    required: [true, "Please provide an email!"],
    unique: [true, "Email Exist"],
  },

  password: {
    type: String,
    required: [true, "Please provide a password!"],
    unique: false,
  },

  name: {
    type: String,
    required: [true, "Please provide a name!"],
    unique: false,
  },

  description: {
    type: String,
    unique: false,
  },
});

const model = mongoose.model("User", UserSchema);

export const schema = model.schema;
export default model;

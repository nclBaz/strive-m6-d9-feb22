import mongoose from "mongoose"

const { Schema, model } = mongoose

const usersSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    age: { type: Number, min: 18, max: 65, required: true },
    professions: [String],
    address: {
      street: { type: String },
      number: { type: Number },
    },
    purchaseHistory: [{ title: String, category: String, asin: String, price: String, purchaseDate: Date }],
  },
  { timestamps: true } // adds and manages automatically createdAt and updatedAt fields
)

export default model("User", usersSchema) // this model is now automatically linked to the "users" collection, if the collection is not there it will be automatically created

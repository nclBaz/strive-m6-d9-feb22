import mongoose from "mongoose"

const { Schema, model } = mongoose

const bookSchema = new Schema(
  {
    asin: { type: String, required: true },
    title: { type: String, required: true },
    img: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true, enum: ["history", "romance", "horror", "fantasy"] },
    authors: [{ type: Schema.Types.ObjectId, ref: "Author" }],
  },
  {
    timestamps: true,
  }
)

// *********************************************************** CUSTOM METHOD *******************************************************
// we are going to attach a custom functionality (a method) to the schema --> everywhere we gonna import the model we gonna have the method available

bookSchema.static("findBooksWithAuthors", async function (query) {
  // If I use an arrow function here, "this" will be undefined. If I use a normal function, "this" will refer to BooksModel itself

  const total = await this.countDocuments(query.criteria)
  const books = await this.find(query.criteria, query.options.fields)
    .skip(query.options.skip || 0)
    .limit(query.options.limit || 10)
    .sort(query.options.sort) // no matter the order in which we use these three methods, Mongo will always do SORT, SKIP then LIMIT in this order
    .populate({ path: "authors", select: "firstName lastName" })

  return { total, books }
})

// USAGE --> const {total, books} = await BooksModel.findBookWithAuthors(q2m(req.query))

export default model("Book", bookSchema)

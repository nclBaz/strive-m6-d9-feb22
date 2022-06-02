import express from "express"
import createError from "http-errors"
import q2m from "query-to-mongo"
import BooksModel from "./model.js"

const booksRouter = express.Router()

booksRouter.post("/", async (req, res, next) => {
  try {
    const newBook = new BooksModel(req.body)
    const { _id } = await newBook.save()
    res.status(201).send({ _id })
  } catch (error) {
    next(error)
  }
})

booksRouter.get("/", async (req, res, next) => {
  try {
    console.log("QUERY: ", req.query)
    console.log("MONGO-QUERY: ", q2m(req.query))

    const mongoQuery = q2m(req.query)
    const total = await BooksModel.countDocuments(mongoQuery.criteria)
    const books = await BooksModel.find(mongoQuery.criteria, mongoQuery.options.fields)
      .skip(mongoQuery.options.skip)
      .limit(mongoQuery.options.limit)
      .sort(mongoQuery.options.sort) // no matter the order in which we use these three methods, Mongo will always do SORT, SKIP then LIMIT in this order
    res.send({ links: mongoQuery.links("http://localhost:3001/books", total), total, totalPages: Math.ceil(total / mongoQuery.options.limit), books })
  } catch (error) {
    next(error)
  }
})

booksRouter.get("/:bookId", async (req, res, next) => {
  try {
    const book = await BooksModel.findById(req.params.bookId)
    if (book) {
      res.send(book)
    } else {
      next(createError(404, `Book with id ${req.params.bookId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

booksRouter.put("/:bookId", async (req, res, next) => {
  try {
    const updatedUser = await BooksModel.findByIdAndUpdate(req.params.bookId, req.body, { new: true, runValidators: true })
    if (updatedUser) {
      res.send(updatedUser)
    } else {
      next(createError(404, `Book with id ${req.params.bookId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

booksRouter.delete("/:bookId", async (req, res, next) => {
  try {
    const deletedUser = await BooksModel.findByIdAndUpdate(req.params.bookId)
    if (deletedUser) {
      res.status(204).send()
    } else {
      next(createError(404, `Book with id ${req.params.bookId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

export default booksRouter

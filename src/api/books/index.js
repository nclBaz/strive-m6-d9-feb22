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
    const mongoQuery = q2m(req.query)
    const { total, books } = await BooksModel.findBooksWithAuthors(mongoQuery)
    res.send({ links: mongoQuery.links("http://localhost:3001/books", total), total, totalPages: Math.ceil(total / mongoQuery.options.limit), books })
  } catch (error) {
    next(error)
  }
})

booksRouter.get("/:bookId", async (req, res, next) => {
  try {
    const book = await BooksModel.findById(req.params.bookId).populate({ path: "authors", select: "firstName lastName" })
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

import express from "express"
import createError from "http-errors"
import UsersModel from "./model.js"
import BooksModel from "../books/model.js"
import CartsModel from "./cartsModel.js"

const usersRouter = express.Router()

usersRouter.post("/", async (req, res, next) => {
  try {
    const newUser = new UsersModel(req.body) // here it happens the validation of req.body, if it is not ok Mongoose will throw an error (if it is ok it is NOT saved yet)
    const { _id } = await newUser.save()
    res.status(201).send({ _id })
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/", async (req, res, next) => {
  try {
    const users = await UsersModel.find()
    res.send(users)
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/:userId", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId)

    if (user) {
      res.send(user)
    } else {
      next(createError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.put("/:userId", async (req, res, next) => {
  try {
    const updatedUser = await UsersModel.findByIdAndUpdate(
      req.params.userId, // WHO
      req.body, // HOW
      { new: true, runValidators: true } // OPTIONS. By default findByIdAndUpdate returns the record pre-modification. If you want to get back the newly updated record you should use the option: new true
      // By default validation is off here --> runValidators: true
    )

    // ***************************************** ALTERNATIVE METHOD **********************************************
    // const user = await UsersModel.findById(req.params.userId) // you get back a MONGOOSE DOCUMENT which is NOT a normal object

    // user.firstName = "John"

    // await user.save()

    if (updatedUser) {
      res.send(updatedUser)
    } else {
      next(createError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.delete("/:userId", async (req, res, next) => {
  try {
    const deletedUser = await UsersModel.findByIdAndDelete(req.params.userId)
    if (deletedUser) {
      res.status(204).send()
    } else {
      next(createError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.post("/:userId/purchaseHistory", async (req, res, next) => {
  try {
    // We gonna receive bookId from req.body. Given that Id, we would like to insert the corresponding book into the purchaseHistory of the specified user

    // 1. Find the book from the books'collection by id
    const purchasedBook = await BooksModel.findById(req.body.bookId, { _id: 0 }) // findById(query, projection) --> with the usage of projection we could remove the original _id from the purchasedBook --> when I am adding the book to the array, Mongo will automagically create a brand new unique _id for that item

    if (purchasedBook) {
      // 2. If the book is found --> add additional info like purchaseDate

      const bookToInsert = { ...purchasedBook.toObject(), purchaseDate: new Date() } // purchasedBook (and EVERYTHING you get from .find() .findById() .findOne()) is a MONGOOSE DOCUMENT (special objects with lots of strange fields), it is NOT A NORMAL OBJECT. Therefore if I want to spread it I shall use .toObject(), which converts a document into a PLAIN OBJECT

      // 3. Update the specified user by adding that book to the purchaseHistory array
      const updatedUser = await UsersModel.findByIdAndUpdate(
        req.params.userId, // WHO
        { $push: { purchaseHistory: bookToInsert } }, // HOW
        { new: true, runValidators: true } // OPTIONS
      )
      if (updatedUser) {
        res.send(updatedUser)
      } else {
        next(createError(404, `User with id ${req.params.userId} not found!`))
      }
    } else {
      // 4. In case of either user or book not found --> 404
      next(createError(404, `Book with id ${req.body.bookId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/:userId/purchaseHistory", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId)
    if (user) {
      res.send(user.purchaseHistory)
    } else {
      next(createError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/:userId/purchaseHistory/:productId", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId)
    if (user) {
      const purchasedBook = user.purchaseHistory.find(book => req.params.productId === book._id.toString()) // You CANNOT compare a string (req.params.productId) with an ObjectId (book._id) --> we shall convert ObjectId into a string
      if (purchasedBook) {
        res.send(purchasedBook)
      } else {
        next(createError(404, `Book with id ${req.params.productId} not found!`))
      }
    } else {
      next(createError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.put("/:userId/purchaseHistory/:productId", async (req, res, next) => {
  try {
    // 1. Find the user by id
    const user = await UsersModel.findById(req.params.userId)

    if (user) {
      // 2. Search for the index of the product into the purchaseHistory array (with JS)
      const index = user.purchaseHistory.findIndex(book => book._id.toString() === req.params.productId)

      if (index !== -1) {
        // 3. Update that product

        user.purchaseHistory[index] = { ...user.purchaseHistory[index].toObject(), ...req.body }

        // 4. Save the user back
        await user.save() // since user is a MONGOOSE DOCUMENT I can use .save()
        res.send(user)
      } else {
        next(createError(404, `Book with id ${req.params.productId} not found!`))
      }
    } else {
      next(createError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.delete("/:userId/purchaseHistory/:productId", async (req, res, next) => {
  try {
    const updatedUser = await UsersModel.findByIdAndUpdate(
      req.params.userId, // WHO
      { $pull: { purchaseHistory: { _id: req.params.productId } } }, // HOW
      { new: true } // OPTIONS
    )

    if (updatedUser) {
      res.send(updatedUser)
    } else {
      next(createError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.post("/:userId/cart", async (req, res, next) => {
  try {
    // we are going to receive bookId and the quantity from req.body
    const { bookId, quantity } = req.body

    // 1. Does the user exist?
    const user = await UsersModel.findById(req.params.userId)
    if (!user) return next(createError(404, `User with id ${req.params.userId} not found!`))

    // 2. Does the book exist?
    const purchasedBook = await BooksModel.findById(bookId)
    if (!purchasedBook) return next(createError(404, `Book with id ${bookId} not found!`))

    // 3. Is the book already in the ACTIVE cart of the specified user?
    const isBookThere = await CartsModel.findOne({ owner: req.params.userId, status: "Active", "products.productId": bookId })

    if (isBookThere) {
      // 3.1 If the book is there --> increase the quantity

      // In plain JS:
      // - find index of the element in products array --> $ = index (in MongoDB $ is the POSITIONAL OPERATOR)
      // - products[index].quantity += quantity --> products[$].quantity += quantity
      // - save it back

      const modifiedCart = await CartsModel.findOneAndUpdate(
        { owner: req.params.userId, status: "Active", "products.productId": bookId }, // WHAT
        { $inc: { "products.$.quantity": quantity } }, // HOW
        { new: true } // OPTIONS
      )
      res.send(modifiedCart)
    } else {
      // 3.2 If it is not --> add to cart (if the cart exists)
      const modifiedCart = await CartsModel.findOneAndUpdate(
        { owner: req.params.userId, status: "Active" }, // WHAT we want to modify
        { $push: { products: { productId: bookId, quantity } } }, // HOW we want to modify it
        { new: true, upsert: true } // OPTIONS. upsert: true does mean that if the active cart of that user is not found --> please create it automagically
      )

      res.send(modifiedCart)
    }
  } catch (error) {
    next(error)
  }
})

export default usersRouter

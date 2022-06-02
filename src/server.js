import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import listEndpoints from "express-list-endpoints"
import usersRouter from "./api/users/index.js"
import booksRouter from "./api/books/index.js"
import { badRequestHandler, genericErrorHandler, notFoundHandler } from "./errorHandlers.js"

const server = express()
const port = process.env.PORT || 3001

// ****************************************************** MIDDLEWARES **********************************************

server.use(cors())
server.use(express.json())

// ******************************************************* ENDPOINTS ***********************************************

server.use("/users", usersRouter)
server.use("/books", booksRouter)

// ***************************************************** ERROR HANDLERS ********************************************

server.use(badRequestHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

mongoose.connect(process.env.MONGO_CONNECTION_URL)

mongoose.connection.on("connected", () => {
  console.log("Successfully connected to Mongo!")
  server.listen(port, () => {
    console.table(listEndpoints(server))
    console.log(`Server is running on port ${port}`)
  })
})

import mongoose from 'mongoose'

const mongooseConnectionMiddleware = (
  handler,
) => async (req, res) => {
  const [connection] = mongoose.connections
  if (connection.readyState !== 1) {
    try {
      await mongoose.connect('mongodb://localhost:27017/Test', {
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
        useUnifiedTopology: true,
      })
    } catch (err) {
      console.log('Failed connection to MONGO DATABASE')
      console.error(err.message)
    }
  }
  return handler(req, res)
}

export default mongooseConnectionMiddleware
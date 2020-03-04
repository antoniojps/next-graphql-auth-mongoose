import mongoose from 'mongoose'
import getConfig from 'next/config'

const MONGODB_URI = getConfig().serverRuntimeConfig.MONGODB_URI

const mongooseConnectionMiddleware = (
  handler,
) => async (req, res) => {
  const [connection] = mongoose.connections
  if (connection.readyState !== 1) {
    try {
      await mongoose.connect(MONGODB_URI, {
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
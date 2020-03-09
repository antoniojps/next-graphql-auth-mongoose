import mongoose from 'mongoose'
import getConfig from 'next/config'
import populateTestDatabase from './../../__tests__/seed'

const MONGODB_URI = getConfig().serverRuntimeConfig.MONGODB_URI

// populate database if test
const isTest = process.env.NODE_ENV === 'test'

const databaseConnection = (
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
      if (isTest) {
        await populateTestDatabase()
      }
    } catch (err) {
      console.log('Failed connection to MONGO DATABASE')
      console.error(err.message)
    }
  }
  return handler(req, res)
}

export default databaseConnection
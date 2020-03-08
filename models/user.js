import mongoose from 'mongoose'
import validator from 'validator'
import jwt from 'jsonwebtoken'
import getConfig from 'next/config'

const { JWT_SECRET, JWT_ISSUER } = getConfig().serverRuntimeConfig

// USER
// schema
const UserSchema = mongoose.Schema({
  email: {
    type: String,
    trim: true,
    unique: true,
    required: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email',
    },
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    trim: true,
  },
  admin: {
    type: Boolean,
    sparce: true,
  },
  moderator: {
    type: Boolean,
    sparce: true,
  },
  verified: {
    type: Boolean,
    sparce: true,
  }
})

// model methods
UserSchema.statics = {
  findByEmail (email) {
    return User.findOne({
      email,
    })
  },
  newUserObj ({email, password}) {
    return {
      email,
      password
    }
  },
  createUser(newUser) {
    const user = new User(newUser)
    return user.save()
  },
}

// instance methods
UserSchema.methods = {
  toObj () {
    const userObj = this.toObject()
    return userObj
  },
  sendValidationEmail() {
    return new Promise((resolve, reject) => {
      const user = this
      if (user.verified) {
        reject(Error('Email already verified'))
      }
      const token = jsonwebtoken.sign(
        {
          _id: user._id,
          email: user.email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '48h',
          issuer: process.env.JWT_ISSUER,
          subject: 'Email validation token',
        }
      ).toString()
      // send email with token
      console.log('email sent with token', { token })
      resolve()
    })
  },
  async verify (token) {
    try {
      const { email } = jwt.verify(token, JWT_SECRET, {
        issuer: JWT_ISSUER,
      })
      const user = this
      user.verified = true
      return user
    } catch (e) {
      throw Error('Invalid email verification token')
    }
  }
}

// model
const User = mongoose.models.User || mongoose.model('User', UserSchema)

export default User

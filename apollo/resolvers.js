import { AuthenticationError, UserInputError } from 'apollo-server-micro'
import cookie from 'cookie'
import jwt from 'jsonwebtoken'
import getConfig from 'next/config'
import bcrypt from 'bcrypt'
import User from './../pages/api/_models/user'

const JWT_SECRET = getConfig().serverRuntimeConfig.JWT_SECRET

async function createUser(data) {
  const salt = bcrypt.genSaltSync()
  const newUser = {
    email: data.email,
    password: bcrypt.hashSync(data.password, salt),
  }
  return await User.createUser(newUser)
}

function validPassword(user, password) {
  return bcrypt.compareSync(password, user.password)
}

export const resolvers = {
  Query: {
    async viewer(_parent, _args, context, _info) {
      const { token } = cookie.parse(context.req.headers.cookie ?? '')
      if (token) {
        try {
          const { id, email } = jwt.verify(token, JWT_SECRET)

          return User.findByEmail(email)
        } catch {
          throw new AuthenticationError(
            'Authentication token is invalid, please log in'
          )
        }
      }
    },
  },
  Mutation: {
    async signUp(_parent, args, _context, _info) {
      const user = await createUser(args.input)
      return { user }
    },

    async signIn(_parent, args, context, _info) {
      const user = await User.findByEmail(args.input.email)
      if (user && validPassword(user, args.input.password)) {
        const token = jwt.sign(
          { email: user.email, id: user.id, time: new Date() },
          JWT_SECRET,
          {
            expiresIn: '6h',
          }
        )

        context.res.setHeader(
          'Set-Cookie',
          cookie.serialize('token', token, {
            httpOnly: true,
            maxAge: 6 * 60 * 60,
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
          })
        )

        return { user }
      }

      throw new UserInputError('Invalid email and password combination')
    },
    async signOut(_parent, _args, context, _info) {
      context.res.setHeader(
        'Set-Cookie',
        cookie.serialize('token', '', {
          httpOnly: true,
          maxAge: -1,
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        })
      )

      return true
    },
  },
}

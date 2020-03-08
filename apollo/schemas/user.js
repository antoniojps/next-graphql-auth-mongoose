import gql from 'graphql-tag'
import { AuthenticationError, UserInputError } from 'apollo-server-micro'
import cookie from 'cookie'
import jwt from 'jsonwebtoken'
import getConfig from 'next/config'
import bcrypt from 'bcrypt'
import User from './../../pages/api/_models/user'
import { secure } from './../utils/filters'

const { JWT_SECRET, JWT_ISSUER, JWT_AUDIENCE } = getConfig().serverRuntimeConfig

export const typeDef = gql`
  type User {
    _id: ID!
    email: String!
    username: String
    admin: Boolean
    moderator: Boolean
    verified: Boolean
  }

  input SignUpInput {
    email: String!
    password: String!
  }

  input SignInInput {
    email: String!
    password: String!
  }

  type SignUpPayload {
    user: User!
  }

  type SignInPayload {
    user: User!
  }

  extend type Query {
    user(id: ID!): User!
    users: [User]!
    viewer: User
  }

  extend type Mutation {
    signUp(input: SignUpInput!): SignUpPayload!
    signIn(input: SignInInput!): SignInPayload!
    signOut: Boolean!
  }
`

async function createUser(data) {
  const salt = bcrypt.genSaltSync()
  const newUser = {
    email: data.email,
    password: bcrypt.hashSync(data.password, salt),
    verified: false,
  }
  return await User.createUser(newUser)
}

function login(user, context) {
  const { _id, email, admin, moderator } = user
  const token = jwt.sign(
    { _id, email, admin, moderator },
    JWT_SECRET,
    {
      expiresIn: '6h',
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE
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
}

function logout(context) {
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
}

function validPassword(user, password) {
  return bcrypt.compareSync(password, user.password)
}

export const resolvers = {
  Query: {
    viewer: secure(async (_parent, _args, context, _info) => {
      const user = await User.findByEmail(context.req.user.email)
      if (!user) {
        logout(context)
        throw new AuthenticationError('User not found')
      }
      return user
    }),
  },
  Mutation: {
    async signUp(_parent, args, context, _info) {
      const user = await createUser(args.input)
      login(user, context)
      return { user }
    },

    async signIn(_parent, args, context, _info) {
      const user = await User.findByEmail(args.input.email)
      if (!user) throw new AuthenticationError('User not found')

      const { _id, email, admin, moderator } = user
      if (user && validPassword(user, args.input.password)) {
        login(user, context)
        return { user }
      }

      throw new UserInputError('Invalid email and password combination')
    },
    async signOut(_parent, _args, context, _info) {
      logout(context)
      return true
    },
  },
}

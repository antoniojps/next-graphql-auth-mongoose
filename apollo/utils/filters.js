
import {
  AuthenticationError,
  ForbiddenError,
  ApolloError,
} from 'apollo-server-micro'
import cookie from 'cookie'
import jwt from 'jsonwebtoken'
import getConfig from 'next/config'
import User from './../../pages/api/_models/user'

const JWT_SECRET = getConfig().serverRuntimeConfig.JWT_SECRET

export function secure (func, admin = false, moderator = false) {
  return async (root, args, context) => {
    let user = null
    const { token } = cookie.parse(context.req.headers.cookie ?? '')
    if (!token) throw new AuthenticationError('Unauthenticated')
    if (token) {
      try {
        const { email } = jwt.verify(token, JWT_SECRET)
        user = await User.findByEmail(email)
      } catch {
        throw new AuthenticationError('Unauthenticated')
      }
    }
    // admin only
    if (admin && !moderator && !user.admin) {
      throw new ForbiddenError('Unauthorized')
      // admin or moderator only
    } else if (
      admin &&
      moderator &&
      (!user.admin && !user.moderator)
    ) {
      throw new ForbiddenError('Unauthorized')
    }
    return func(root, args, {...context, user})
  }
}
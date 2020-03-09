import cookie from 'cookie'
import jwt from 'jsonwebtoken'
import getConfig from 'next/config'

const { JWT_SECRET, JWT_ISSUER, JWT_AUDIENCE } = getConfig().serverRuntimeConfig

const jwtParser = (handler) => {
  return async (req, res) => {
    let user = null
    const { token } = cookie.parse(req.headers.cookie ?? '')
    if (token) {
      try {
        user = jwt.verify(
          token,
          JWT_SECRET,
          {
            expiresIn: '6h',
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE
          }
        )
      } catch {
        user = null
      }
    }
    req.user = user
    return handler(req, res);
  }
}

export default jwtParser
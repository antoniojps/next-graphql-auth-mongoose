import gql from 'graphql-tag'
import request from 'supertest'
import { usersTokens, defaultUsers } from './seed/users'
import micro from 'micro';
import { apolloServer } from '../pages/api/graphql'
import middleware from './../utils/middlewares/middleware'

// start test server
function createServer(options = { path: '/api/graphql' }) {
  const app = micro(middleware(apolloServer.createHandler(options)));
  return app
}

const VIEWER = `{
  viewer {
    _id
    email
  }
}`
describe('authentication', () => {
  describe('QUERIES', () => {
    it('should return Unauthenticated if not logged in',
      async () => {
        const app = createServer()
        const req = request(app)
          .post('/api/graphql')
          .send({ query: VIEWER })

        const res = await req
        expect(res.status).toEqual(200);
        expect(res.body.errors[0].message).toBe('Unauthenticated')
        app.close()
      }
    )

    it('should return current user',
      async () => {
        const app = createServer()
        const req = request(app)
          .post('/api/graphql')
          .set('Cookie', `token=${usersTokens.normal}; HttpOnly`)
          .send({ query: VIEWER })

        const res = await req
        expect(res.status).toEqual(200);
        expect(res.body.data.viewer.email).toBe(
          defaultUsers.normal.email
        )
        app.close()
      }
    )
  })
})
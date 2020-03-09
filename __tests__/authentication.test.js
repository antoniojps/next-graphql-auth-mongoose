import gql from 'graphql-tag'
import request from 'supertest'
import { usersTokens, defaultUsers } from './seed/users'
import micro from 'micro';
import { apolloServer } from '../pages/api/graphql'
import middleware from './../utils/middlewares/middleware'
import { populateDatabase } from './seed'

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

it('should return UNAUTHENTICATED if not logged in',
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
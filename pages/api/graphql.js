import { ApolloServer } from 'apollo-server-micro'
import { schema } from '../../apollo/schema'
import middleware from './_middlewares/middleware'

const apolloServer = new ApolloServer({
  schema,
  context(ctx) {
    return ctx
  },
})

// custom config
// https://nextjs.org/docs/api-routes/api-middlewares#custom-config
export const config = {
  api: {
    bodyParser: false,
  },
}

const apolloHandler = apolloServer.createHandler({ path: '/api/graphql' })

export default middleware(apolloHandler)

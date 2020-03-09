import { ApolloServer } from 'apollo-server-micro';
import { schema } from '../../graphql/schema';
import middleware from './../../utils/middlewares/middleware';

export const apolloServer = new ApolloServer({
  schema,
  context(ctx) {
    return ctx;
  },
});

// custom config
// https://nextjs.org/docs/api-routes/api-middlewares#custom-config
export const config = {
  api: {
    bodyParser: false,
  },
};

const apolloHandler = apolloServer.createHandler({
  path: process.env.GRAPHQL_ENDPOINT,
});

export default middleware(apolloHandler);

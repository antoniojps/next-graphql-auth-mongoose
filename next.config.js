require('dotenv').config();

module.exports = {
  env: {
    DOMAIN: process.env.DOMAIN,
    GRAPHQL_ENDPOINT: process.env.GRAPHQL_ENDPOINT,
  },
};

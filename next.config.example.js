const config = {
  test: {
    MONGODB_URI: 'mongodb://localhost:27017/NextAuthTest',
    JWT_SECRET: 'superTESTsecret',
    JWT_AUDIENCE: 'authentication-server',
    JWT_ISSUER: 'authentication-server',
    EMAIL_API_KEY: 'xxx',
    EMAIL_SENDER: 'mail@domain.com',
    DOMAIN: 'http://localhost:3000',
    GRAPHQL_ENDPOINT: '/api/graphql',
  },
  development: {
    MONGODB_URI: 'mongodb://localhost:27017/NextAuthDev',
    JWT_SECRET: 'ohthisisevenmoresecret',
    JWT_AUDIENCE: 'authentication-server',
    JWT_ISSUER: 'authentication-server',
    EMAIL_API_KEY: 'xxx',
    EMAIL_SENDER: 'mail@domain.com',
    DOMAIN: 'http://localhost:3000',
    GRAPHQL_ENDPOINT: '/api/graphql',
  },
  production: {
    MONGODB_URI: 'mongodb://localhost:27017/NextAuthProd',
    JWT_SECRET:
      "x^k*HJ1zv^?6;Z-qY[;4bwW;tv=o<$j#8mS|p)aRO(:d>f#jDAckiwFsH6'!P^",
    JWT_AUDIENCE: 'authentication-server',
    JWT_ISSUER: 'authentication-server',
    EMAIL_API_KEY: 'xxx',
    EMAIL_SENDER: 'mail@domain.com',
    DOMAIN: 'http://localhost:3000',
    GRAPHQL_ENDPOINT: '/api/graphql',
  },
};

module.exports = {
  serverRuntimeConfig: config[process.env.NODE_ENV],
};

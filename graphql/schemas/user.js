import gql from 'graphql-tag';
import { AuthenticationError, UserInputError } from 'apollo-server-micro';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from './../../models/user';
import { secure, StatusError } from './../utils/filters';

const { JWT_SECRET, JWT_ISSUER, JWT_AUDIENCE } = process.env;

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

  type UserPayload {
    user: User!
  }

  input SignInInput {
    email: String!
    password: String!
  }

  type VerifyEmailPayload {
    email: String!
    verified: Boolean!
  }

  input VerifyEmailInput {
    token: String!
  }

  extend type Query {
    user(id: ID!): User!
    users: [User]!
    currentUser: User
  }

  extend type Mutation {
    signUp(input: SignUpInput!): UserPayload!
    signIn(input: SignInInput!): UserPayload!
    signOut: Boolean!
    sendVerificationEmail: Boolean!
    verifyEmail(input: VerifyEmailInput!): VerifyEmailPayload!
  }
`;

async function createUser(data) {
  const salt = bcrypt.genSaltSync();
  const newUser = {
    email: data.email,
    password: bcrypt.hashSync(data.password, salt),
    verified: false,
  };
  return await User.createUser(newUser);
}

function login(user, context) {
  const { _id, email, admin, moderator } = user;
  const token = jwt.sign({ _id, email, admin, moderator }, JWT_SECRET, {
    expiresIn: '6h',
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });

  context.res.setHeader(
    'Set-Cookie',
    cookie.serialize('token', token, {
      httpOnly: true,
      maxAge: 6 * 60 * 60,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
  );
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
  );
}

function validPassword(user, password) {
  return bcrypt.compareSync(password, user.password);
}

export const resolvers = {
  Query: {
    currentUser: secure(async (_parent, _args, context) => {
      const user = await User.findByEmail(context.req.user.email);
      if (!user) {
        logout(context);
        throw new AuthenticationError('User not found');
      }
      return user;
    }),
  },
  Mutation: {
    signUp: async (_parent, args, context) => {
      const user = await createUser(args.input);
      login(user, context);
      return {user};
    },

    signIn:  async  (_parent, args, context) => {
      const user = await User.findByEmail(args.input.email);
      if (!user) throw new AuthenticationError('User not found');

      const { _id, email, admin, moderator } = user;
      if (user && validPassword(user, args.input.password)) {
        login(user, context);
        return {user};
      }
      throw new UserInputError('Invalid email and password combination');
    },
    signOut: async (_parent, _args, context) => {
      logout(context);
      return true;
    },
    sendVerificationEmail: secure(async (_parent, _args, context) => {
      const user = context.req.user
      if (user.verified) throw new StatusError(400, 'Email already verified')
      const token = jwt
        .sign(
          {
            _id: user._id,
            email: user.email,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: '48h',
            issuer: process.env.JWT_ISSUER,
            subject: 'Email validation token',
          }
        )
        .toString();
      console.log(token)
      // send email
      return true
    }),
    verifyEmail: secure(async (_parent, args, context) => {
      const { token } = args.input
      const user = await User.findByEmail(context.req.user.email);
      if (!user) {
        logout(context);
        throw new AuthenticationError('User not found');
      }
      try {
        const { email: emailVerified } = jwt.verify(token, JWT_SECRET, {
          issuer: JWT_ISSUER,
        });
        if (user.email !== emailVerified) throw new StatusError(401, 'User does not match');
        user.verified = true;
        await user.save()
        return {
          email: user.email,
          verified: true,
        }
      } catch (e) {
        if (process.env !== 'production') throw new Error(e.message)
        throw Error('Invalid email verification token');
      }
    }),
  },
};

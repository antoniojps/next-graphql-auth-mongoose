import { ObjectID } from 'mongodb'
import User from './../../models/user'
import jsonwebtoken from 'jsonwebtoken'
import getConfig from 'next/config'
import bcrypt from 'bcrypt'

const userOneID = new ObjectID()
const userTwoID = new ObjectID()
const userThreeID = new ObjectID()
const userFourID = new ObjectID()

const { JWT_SECRET, JWT_AUDIENCE, JWT_ISSUER } = getConfig().serverRuntimeConfig

export function generateAuthToken (id, admin, moderator) {
  const token = jsonwebtoken
    .sign(
      {
        id,
        admin: !!admin,
        moderator: !!moderator,
      },
      JWT_SECRET,
      {
        expiresIn: '24h',
        audience: JWT_AUDIENCE,
        issuer: JWT_ISSUER,
        subject: id,
      }
    )
    .toString()
  return token
}

const salt = bcrypt.genSaltSync()

export const defaultUsers = {
  admin: {
    _id: userOneID,
    email: 'userOne@mail.com',
    username: 'admin',
    password: bcrypt.hashSync('123', salt),
  },
  moderator: {
    _id: userThreeID,
    email: 'userThree@mail.com',
    username: 'moderator',
    password: bcrypt.hashSync('123', salt),
  },
  normal: {
    _id: userTwoID,
    email: 'userTwo@mail.com',
    username: 'normal',
    password: bcrypt.hashSync('123', salt),
  },
  normalAlt: {
    _id: userFourID,
    email: 'userFour@mail.com',
    username: 'normalFour',
    password: bcrypt.hashSync('123', salt),
  },
}

export const usersTokens = {
  admin: generateAuthToken(defaultUsers.admin._id.toHexString(), true),
  moderator: generateAuthToken(
    defaultUsers.moderator._id.toHexString(),
    false,
    true
  ),
  normal: generateAuthToken(defaultUsers.normal._id.toHexString()),
  normalAlt: generateAuthToken(defaultUsers.normalAlt._id.toHexString()),
}

export const populateUsers = () => {
  return new Promise((resolve, reject) => {
    User.deleteMany({}).then(() => {
      const createUsers = Object.keys(defaultUsers).map(key =>
        new User(defaultUsers[key]).save()
      )
      Promise.all(createUsers).then(() => {
        console.log('Populated users', new Date())
        resolve()
      })
    }).catch(err => reject(err))
  })
}

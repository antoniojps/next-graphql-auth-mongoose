import { populateUsers } from './users'

export function populateDatabase () {
  return new Promise((resolve, reject) => {
    populateUsers().then(resolve).catch(reject)
  })
}

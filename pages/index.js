import { withApollo } from '../apollo/client'
import gql from 'graphql-tag'
import Link from 'next/link'
import { useQuery } from '@apollo/react-hooks'
import { useRouter } from 'next/router'

const ViewerQuery = gql`
  query ViewerQuery {
    viewer {
      _id
      email
    }
  }
`

const Index = () => {
  const router = useRouter()
  const { data, loading, error } = useQuery(ViewerQuery)

  if (
    loading === false &&
    error &&
    typeof window !== 'undefined'
  ) {
    router.push('/signin')
  }

  if (data && data.viewer) {
    return (
      <div>
        You're signed in as {data.viewer.email} with id ${data.viewer._id} goto{' '}
        <Link href="/about">
          <a>static</a>
        </Link>{' '}
        page. or{' '}
        <Link href="/signout">
          <a>signout</a>
        </Link>
      </div>
    )
  }

  return <p>Loading...</p>
}

export default withApollo(Index)

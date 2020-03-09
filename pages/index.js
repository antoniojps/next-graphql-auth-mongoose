import { withApollo } from '../graphql/client';
import gql from 'graphql-tag';
import Link from 'next/link';
import { useQuery } from '@apollo/react-hooks';
import { useRouter } from 'next/router';

const CurrentUserQuery = gql`
  query CurrentUserQuery {
    currentUser {
      _id
      email
      username
      admin
      moderator
      verified
    }
  }
`;

const Index = () => {
  const router = useRouter();
  const { data, loading, error } = useQuery(CurrentUserQuery);

  if (error) {
    router.push('/signin');
  }

  if (data && data.currentUser) {
    return (
      <>
        <div>
          You're signed in as {data.currentUser.email} with id $
          {data.currentUser._id} goto{' '}
          <Link href="/about">
            <a>static</a>
          </Link>{' '}
          page. or{' '}
          <Link href="/signout">
            <a>signout</a>
          </Link>
        </div>
        <code>{JSON.stringify(data.currentUser, null, 2)}</code>
      </>
    );
  }
  if (loading) return <p>Loading...</p>;
  return <p>User not found</p>;
};

export default withApollo({ ssr: true })(Index);

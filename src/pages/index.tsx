import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import ptBr from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [post, setPost] = useState<Post[]>(
    postsPagination.results.map(formatted => ({
      ...formatted,
      first_publication_date: format(
        new Date(formatted.first_publication_date),
        'dd MM yyyy',
        { locale: ptBr }
      ),
    }))
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [loadMore, setLoadMore] = useState<Post[]>([]);

  useEffect(() => {
    async function getNextPage(): Promise<void> {
      const response = await fetch(`${nextPage}`);
      const data = await response.json();
      setLoadMore(data.results);
    }
    getNextPage();
  }, []);

  const handleLoadMorePosts = (): void => {
    const newState = [...post];

    const newLoadMore = loadMore.map((loadMore1: Post) => ({
      uid: loadMore1.uid,
      first_publication_date: format(
        new Date(loadMore1.first_publication_date),
        'dd MM yyyy',
        { locale: ptBr }
      ),
      data: {
        title: loadMore1.data.title,
        author: loadMore1.data.author,
        subtitle: loadMore1.data.subtitle,
      },
    }));

    newState.push(...newLoadMore);
    setPost(newState);
  };

  return (
    <main className={commonStyles.container}>
      <Header />
      {post.map(posts => (
        <Link key={posts.uid} href={`/post/${posts.uid}`}>
          <div className={styles.postWrapp}>
            <h1> {posts.data.title} </h1>
            <p>{posts.data.subtitle}</p>
            <time> {posts.first_publication_date} </time>
            <span> {posts.data.author}</span>
          </div>
        </Link>
      ))}
      {!!nextPage && (
        <button
          onClick={handleLoadMorePosts}
          className={styles.loadMorePosts}
          type="submit"
        >
          Carregar mais
        </button>
      )}
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'nextblog1')],
    {
      pageSize: 1,
    }
  );

  const response = postsResponse.results.map((posts: Post) => {
    return {
      uid: posts.uid,
      first_publication_date: posts.first_publication_date,
      data: {
        title: posts.data.title,
        subtitle: posts.data.subtitle,
        author: posts.data.author,
      },
    };
  });

  const postsPagination = {
    results: response,
    next_page: postsResponse.next_page,
  };

  return {
    props: { postsPagination },
    revalidate: 60 * 60,
  };
};

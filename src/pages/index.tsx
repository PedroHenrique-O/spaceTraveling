/* eslint-disable no-console */
import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';

import Link from 'next/link';
import { useEffect } from 'react';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

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
  console.log(postsPagination.results);
  return (
    <main className={commonStyles.container}>
      <div className={styles.logoWrapp}> Logo </div>
      {postsPagination.results.map((posts: Post) => (
        <Link key={posts.uid} href={`/post/${posts.uid}`}>
          <div className={styles.postWrapp}>
            <h1> {posts.data.title} </h1>
            <p>{posts.data.subtitle}</p>
            <time> {posts.first_publication_date} </time>
            <span> {posts.data.author}</span>
          </div>
        </Link>
      ))}
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'nextblog1')],
    {
      pageSize: 2,
    }
  );

  const response = postsResponse.results.map((posts: Post) => {
    return {
      uid: posts.uid,
      first_publication_date: new Date(
        posts.first_publication_date
      ).toLocaleDateString('pt-br', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
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

  console.log('---------', postsPagination.results, '---------');

  return {
    props: { postsPagination },
  };
};

import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';

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
  return (
    <main className={styles.container}>
      <div className={styles.logoWrapp}> Logo </div>
      <div className={styles.postWrapp}>
        <h1> Title</h1>
        <p>Subtitle</p>
        <time>12 dezembro 2021 </time>
        <span> Pedro Henrique </span>
      </div>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient(context.preview);
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'nextblog1')],
    {
      fetch: ['title', 'content'],
      pageSize: 1,
    }
  );

  const response = postsResponse.results.map((posts: Post) => {
    return {
      slug: posts.uid,
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
    props: postsPagination,
  };
};

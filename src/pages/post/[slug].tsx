/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';

import Prismic from '@prismicio/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>([]);

  return (
    <>
      <Head> SpaceTraveling | Posts </Head>
      <main className={commonStyles.container}>
        <div className={styles.titleWrapp}>
          <h1>{post.data.title}</h1>
          <time>
            {new Date(post.first_publication_date).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
            )
          </time>
          <span> {post.data.author} </span>
          <span className={styles.time}> 4m </span>
        </div>

        {post.data.content.map(content => (
          <>
            <h1> {RichText.asText(content.heading)} </h1>

            <section>{RichText.asText(content.body)}</section>
          </>
        ))}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
  // const prismic = getPrismicClient();
  // const posts = await prismic.query([
  //   Prismic.predicates.at('document.type', 'nextblog1'),
  // ]);

  // const paths = posts.results;

  // return {
  //   paths: posts.results.map(post => {
  //     return { params: { slug: post.uid } };
  //   }),
  //   fallback: 'blocking',
  // };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response: Post = await prismic.getByUID('nextblog1', String(slug), {});

  const post = response;

  return {
    props: { post },
  };
};

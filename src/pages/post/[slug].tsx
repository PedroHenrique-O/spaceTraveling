/* eslint-disable react/no-danger */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';

import Prismic from '@prismicio/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    image: {
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
      <Image
        alt="banner"
        width="1120p"
        height="400"
        src={post.data.image.url}
      />
      <main className={commonStyles.container}>
        <div className={styles.titleWrapp}>
          <h1>{post.data.title}</h1>
          <time>
            {new Date(post.first_publication_date).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </time>
          <span> {post.data.author} </span>
          <span className={styles.time}> 4m </span>
        </div>
        <h1> </h1>

        {post.data.content.map((content, index) => (
          <>
            <h1> {RichText.asText(content.heading)} </h1>
            <div
              className="teste"
              dangerouslySetInnerHTML={{
                __html: RichText.asHtml(content.body),
              }}
            />
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
  console.log('banner: ', JSON.stringify(post.data.content, null, 3));

  return {
    props: { post },
    revalidate: 1,
  };
};

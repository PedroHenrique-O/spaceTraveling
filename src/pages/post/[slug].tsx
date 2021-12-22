/* eslint-disable react/self-closing-comp */
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';

import { useMemo } from 'react';
import Prismic from '@prismicio/client';
import Head from 'next/head';
import Image from 'next/image';
import {
  AiOutlineClockCircle,
  AiOutlineUser,
  AiOutlineCalendar,
} from 'react-icons/ai';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';

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
  const router = useRouter();

  const formattedDate = format(
    new Date(post.first_publication_date),
    'dd MMM yyyy',
    {
      locale: ptBR,
    }
  );

  const EstimatedReadTime = useMemo(() => {
    let fullText = '';

    const wordsPerMinute = 200;

    post?.data.content.forEach(postContent => {
      fullText += postContent.heading;
      fullText += RichText.asText(postContent.body);
    });
    const time = Math.ceil(fullText.split(/\s+/).length / wordsPerMinute);
    return time;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }
  return (
    <>
      <Header />
      <Head> SpaceTraveling | Posts </Head>
      <div className={styles.bannerWrap}>
        <Image
          alt="banner"
          width="1400px"
          height="350px"
          src={post.data.banner.url}
        />
      </div>
      <main className={commonStyles.container}>
        <div className={styles.titleWrapp}>
          <h1>{post.data.title}</h1>
          <time>
            <AiOutlineCalendar />
            {`${formattedDate}`}
          </time>

          <span>
            <AiOutlineUser />
            {post.data.author}
          </span>
          <span id="time" className={styles.time}>
            <AiOutlineClockCircle />
            {EstimatedReadTime} min
          </span>
        </div>

        {post.data.content.map(content => {
          return (
            <section key={content.heading} className={styles.contentWrapper}>
              <h2>{content.heading} </h2>

              <div
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              ></div>
            </section>
          );
        })}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'nextblog1')],
    { pageSize: 1 }
  );
  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));
  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response: Post = await prismic.getByUID('nextblog1', String(slug), {});

  const post: Post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => ({
        heading: content.heading,
        body: [...content.body],
      })),
    },
  };

  return {
    props: { post },

    redirect: 60 * 1, // one minute
  };
};

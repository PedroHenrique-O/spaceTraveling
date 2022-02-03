/* eslint-disable react/self-closing-comp */
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import Link from 'next/link';

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
import Comments from '../../components/Comments';

interface Post {
  id?: string;
  first_publication_date: string | null;
  last_publication_date: string | null;
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
  preview: boolean;
  navigation: {
    prevPost: {
      uid: string;
      data: {
        title: string;
      };
    }[];
    nextPost: {
      uid: string;
      data: {
        title: string;
      };
    }[];
  };
}

export default function Post({
  post,
  preview,
  navigation,
}: PostProps): JSX.Element {
  const router = useRouter();

  const formattedDate = format(
    new Date(post.first_publication_date),
    'dd MMM yyyy',
    {
      locale: ptBR,
    }
  );

  const formattedDateLastPub = format(
    new Date(post.last_publication_date),
    'dd MMM yyyy',
    {
      locale: ptBR,
    }
  );

  const isPostEdited = formattedDate !== formattedDateLastPub;
  let editiondate;
  if (isPostEdited) {
    editiondate = format(
      new Date(post.first_publication_date),
      "'* editado em' dd MMM yyyy', às' H': 'mm",
      {
        locale: ptBR,
      }
    );
  }

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
        <span className={styles.editedTime}>
          {isPostEdited && <time> {editiondate} </time>}
        </span>

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

        <section className={`${styles.navigation} ${commonStyles.container}`}>
          {navigation?.prevPost.length > 0 && (
            <div>
              <h3>{navigation.prevPost[0].data.title}</h3>
              <Link href={`/post/${navigation.prevPost[0].uid}`}>
                <a> Post anterior </a>
              </Link>
            </div>
          )}
          {navigation?.nextPost.length > 0 && (
            <div>
              <h3>{navigation.nextPost[0].data.title}</h3>
              <Link href={`/post/${navigation.nextPost[0].uid}`}>
                <a> Próximo post </a>
              </Link>
            </div>
          )}
        </section>

        <Comments />
        {preview && (
          <aside>
            <Link href="/api/exit-preview">
              <a className={commonStyles.preview}>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'nextblog1')],
    {
      pageSize: 2,
    }
  );

  console.log('result:', posts);

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response: Post = await prismic.getByUID('nextblog1', String(slug), {
    ref: previewData?.ref ?? null,
  });
  const prevPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'nextblog1')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date]',
    }
  );

  const nextPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'nextblog1')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[documents.last_publication_date desc]',
    }
  );

  const post = response;

  console.log('debaixo', response);

  // Post = {
  //   first_publication_date: response.first_publication_date,
  //   data: {
  //     title: response.data.title,
  //     author: response.data.author,
  //     banner: {
  //       url: response.data.banner.url,
  //     },
  //     content: response.data.content.map(content => ({
  //       heading: content.heading,
  //       body: [...content.body],
  //     })),
  //   },
  // };

  // console.log(JSON.stringify(response, null, 4));

  return {
    props: {
      post,
      navigation: {
        prevPost: prevPost?.results,
        nextPost: nextPost?.results,
      },
      preview,
    },

    redirect: 60 * 1, // one minute
  };
};

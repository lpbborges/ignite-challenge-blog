import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { RichText } from 'prismic-dom';
import { useMemo } from 'react';

import { useRouter } from 'next/router';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

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
  const router = useRouter();

  const postFormatted = useMemo(() => {
    const content = post.data.content.map(postContent => {
      return {
        heading: postContent.heading,
        body: RichText.asHtml(postContent.body),
      };
    });

    const wordsInContent = post.data.content.reduce((acc, con) => {
      const wordsInHeading = con.heading.split(' ').length;
      const wordsInBody = RichText.asText(con.body).split(' ').length;

      return acc + wordsInHeading + wordsInBody;
    }, 0);

    const expectedTimeReadingInMinutes = Math.ceil(wordsInContent / 200);

    return {
      firstPublicationDate: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
      data: {
        ...post.data,
        content,
      },
      expectedTimeReadingInMinutes,
    };
  }, [post]);

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Header />
      <div className={styles.banner}>
        <Image src={postFormatted.data.banner.url} width={2048} height={400} />
      </div>
      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{postFormatted.data.title}</h1>
          <div className={styles.info}>
            <small>
              <FiCalendar size={20} />
              {postFormatted.firstPublicationDate}
            </small>
            <small>
              <FiUser size={20} />
              {postFormatted.data.author}
            </small>
            <small>
              <FiClock size={20} />
              {`${postFormatted.expectedTimeReadingInMinutes} min`}
            </small>
          </div>
          {postFormatted.data.content.map(content => (
            <div key={content.heading} className={styles.postContent}>
              <h2>{content.heading}</h2>
              <div
                className={styles.contentBody}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: content.body,
                }}
              />
            </div>
          ))}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.banner', 'posts.author', 'posts.content'],
      pageSize: 5,
    }
  );

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {});

  return {
    props: { post: response },
  };
};

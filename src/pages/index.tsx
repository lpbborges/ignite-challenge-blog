import { GetStaticProps } from 'next';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { useEffect } from 'react';
import { useState } from 'react';
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
  const { next_page, results } = postsPagination;
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextPage, setNextPage] = useState('');

  useEffect(() => {
    setNextPage(next_page);
    setPosts(results);
  }, [next_page, results]);

  const handleFetchMorePosts = async (nextPageUrl: string): Promise<void> => {
    const response = await fetch(nextPageUrl);
    const data = await response.json();
    setNextPage(data.next_page);
    setPosts(state => [...state, ...data.results]);
  };

  return (
    <>
      <Header />
      <main className={commonStyles.wrapper}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link key={post.uid} href={`/posts/${post.uid}`}>
              <a className={styles.post}>
                <h2>{post.data.title}</h2>
                <p>{post.data.subtitle}</p>
                <div className={styles.info}>
                  <div>
                    <FiCalendar size={20} />
                    <span>{post.first_publication_date}</span>
                  </div>
                  <div>
                    <FiUser size={20} />
                    <span>{post.data.author}</span>
                  </div>
                </div>
              </a>
            </Link>
          ))}
          {nextPage && (
            <button
              className={styles.buttonLoadMorePosts}
              type="button"
              onClick={() => handleFetchMorePosts(nextPage)}
            >
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 5,
    }
  );

  const posts = postResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.last_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
      data: {
        title: post.data.title as string,
        subtitle: post.data.subtitle as string,
        author: post.data.author as string,
      },
    };
  });

  const postsPagination = {
    next_page: postResponse.next_page,
    results: posts,
  };

  return {
    props: { postsPagination },
  };
};

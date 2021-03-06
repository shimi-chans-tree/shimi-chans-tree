import React from 'react';
import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import cheerio from 'cheerio';
import hljs from 'highlight.js';
import BlogItemTemplate from '../components/pages/BlogItemTemplate';

/* apis */
import { getBlogsApi, getBlogByApi } from '../apis/BlogApi';
import { getCategoriesApi } from '../apis/CategoryApi';
import { getProfileByApi } from '../apis/ProfileApi';
/* constants */
import { BLOG_SHOW_COUNT } from '../constants/config';
/* logic */
import { createPageArrayLogic } from '../logic/CommonLogic';
import { BlogItemType } from '../types/Blog';
import { CategoryType } from '../types/Category';
import { ProfileType } from '../types/Profile';

type BlogItemPageProps = {
  blogItem: BlogItemType;
  highlightedBody: string;
  categories: CategoryType;
  profile: ProfileType;
  draftKey: string;
};

const Home: NextPage<BlogItemPageProps> = (props) => {
  const { blogItem, highlightedBody, draftKey } = props;
  return (
    <BlogItemTemplate
      blogItem={blogItem}
      highlightedBody={highlightedBody}
      draftKey={draftKey}
    />
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths: string[] = [];
  const { totalCount } = await getBlogsApi(0);

  // ページ番号の配列を作成
  const pageCountArray = createPageArrayLogic(totalCount);

  for await (const pageNum of pageCountArray) {
    const offset = (pageNum - 1) * BLOG_SHOW_COUNT;
    const blogData = await getBlogsApi(offset);
    blogData.blogList.forEach((blog) => {
      paths.push(`/${blog.id}`);
    });
  }

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { params, previewData } = context;

  let blogId = '';
  let draftKey = '';

  if (!params?.blogId) {
    throw new Error('Error: ID not found');
  }

  if (params?.blogId && typeof params.blogId === 'string') {
    blogId = params.blogId;
  }

  const isDraft = (item: any): item is { draftKey: string } =>
    !!(item?.draftKey && typeof item.draftKey === 'string');

  if (isDraft(previewData)) {
    draftKey = previewData.draftKey;
  }

  try {
    // ブログ記事詳細データ取得 ---------
    const blogDetailData = await getBlogByApi(blogId, draftKey);
    // カテゴリーデータ取得 ---------
    const categoryData = await getCategoriesApi();

    // プロフィールデータ取得 ---------
    const profile = await getProfileByApi();

    // シンタックハイライト文章作成
    const $ = cheerio.load(blogDetailData.content);
    $('pre code').each((_, elm) => {
      const result = hljs.highlightAuto($(elm).text());
      $(elm).html(result.value);
      $(elm).addClass('hljs');
    });

    const props = {
      blogItem: blogDetailData,
      highlightedBody: $.html(),
      categories: categoryData,
      profile: profile,
      draftKey: draftKey,
    };
    return { props };
  } catch (error) {
    console.log(error); // eslint-disable-line no-console
    return { notFound: true };
  }
};

export default Home;

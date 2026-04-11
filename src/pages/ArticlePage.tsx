import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getArticle, getCategories } from '../services/db';
import { Article, Category } from '../types';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Music, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      const fetchedArticle = await getArticle(id);
      if (fetchedArticle) {
        setArticle(fetchedArticle);
        const categories = await getCategories();
        setCategory(categories.find(c => c.id === fetchedArticle.categoryId) || null);
      }
      setLoading(false);
    };
    fetchArticle();
  }, [id]);

  if (loading) {
    return <div className="py-12 text-center text-stone-500">加载文章中...</div>;
  }

  if (!article) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-2xl font-serif mb-4">未找到文章</h2>
        <Link to="/">
          <Button variant="outline">返回首页</Button>
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-5xl mx-auto pb-20 px-4">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        返回首页
      </Link>

      {article.coverImage ? (
        <div className="relative w-full h-[40vh] md:h-[55vh] rounded-[2.5rem] overflow-hidden shadow-md">
          <img 
            src={article.coverImage} 
            alt={article.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>
      ) : null}

      <div className={`bg-white rounded-[2.5rem] shadow-sm border border-stone-100/50 p-6 md:p-12 lg:p-16 relative z-10 ${article.coverImage ? '-mt-20 md:-mt-32 mx-4 md:mx-8' : 'mt-0'}`}>
        <header className="mb-10 text-center">
          <div className="mb-6">
            <span className="inline-block px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-orange-700 bg-orange-50 rounded-full">
              {category?.name || '未分类'}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-stone-900 mb-6 leading-tight">
            {article.title}
          </h1>
          <div className="text-sm text-stone-500 flex items-center justify-center gap-4">
            <time dateTime={new Date(article.createdAt).toISOString()}>
              {format(article.createdAt, 'yyyy年MM月dd日')}
            </time>
          </div>
          
          {article.bgMusicUrl && (
            <div className="mt-8 flex flex-col items-center justify-center bg-orange-50/50 p-4 rounded-3xl border border-orange-100/50 max-w-md mx-auto">
              <div className="flex items-center gap-2 text-sm text-orange-800 mb-3 font-medium">
                <Music className="w-4 h-4" />
                <span>背景音乐</span>
              </div>
              <audio 
                controls 
                src={article.bgMusicUrl} 
                loop 
                className="w-full h-10 outline-none"
                onError={(e) => console.error("Audio failed to load:", e)}
              >
                您的浏览器不支持 audio 标签。
              </audio>
            </div>
          )}
        </header>

        <hr className="border-stone-100 mb-12" />

        <div className="prose prose-stone prose-lg max-w-none prose-headings:font-serif prose-img:rounded-2xl prose-img:shadow-sm prose-a:text-orange-600 hover:prose-a:text-orange-700 mx-auto">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
        </div>
      </div>
    </article>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getArticles, getCategories } from '../services/db';
import { Article, Category } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Music } from 'lucide-react';
import { motion } from 'motion/react';

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [siteConfig, setSiteConfig] = useState({ homeBgmUrl: '', homeBgImageUrl: '' });

  useEffect(() => {
    const fetchData = async () => {
      const [fetchedArticles, fetchedCategories] = await Promise.all([
        getArticles(),
        getCategories()
      ]);
      setArticles(fetchedArticles);
      setCategories(fetchedCategories);
      setLoading(false);
    };
    fetchData();

    fetch('/site-config.json')
      .then(res => res.json())
      .then(data => setSiteConfig(data))
      .catch(err => console.error('Failed to load site config:', err));
  }, []);

  const filteredArticles = selectedCategory 
    ? articles.filter(a => a.categoryId === selectedCategory)
    : articles;

  if (loading) {
    return <div className="py-12 text-center text-stone-500">加载文章中...</div>;
  }

  return (
    <div className="w-full max-w-[94vw] xl:max-w-[1400px] mx-auto pb-24">
      {/* Full Page Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-stone-900">
        {siteConfig.homeBgImageUrl && (
          <div 
            className="absolute inset-0 bg-cover bg-center scale-110 blur-[10px] transition-all duration-1000"
            style={{ backgroundImage: `url(${siteConfig.homeBgImageUrl})` }}
          ></div>
        )}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
      </div>

      {/* Hero Section (Framed & Hoverable) */}
      <div className="relative z-10 w-full mx-auto mt-8 mb-16">
        <div className="group flex flex-col items-center justify-center min-h-[38vh] p-10 md:p-16 rounded-[3rem] bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl transition-all duration-700 hover:shadow-[0_30px_60px_-15px_rgba(255,165,0,0.2)] hover:bg-white/20 hover:-translate-y-3 hover:border-white/40 overflow-hidden relative cursor-default">
          
          {/* Decorative subtle gradient orb inside the frame on hover */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-48 bg-orange-400/20 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-serif font-bold text-white mb-8 tracking-tight drop-shadow-xl text-center relative z-10"
          >
            欢迎聆听<span className="text-orange-400">暖阁的---风声</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-2xl md:text-3xl text-stone-100 max-w-3xl mx-auto leading-relaxed drop-shadow-lg text-center relative z-10"
            style={{ fontFamily: "'FangSong', 'STFangsong', 'Kaiti', serif" }}
          >
            人一定要爱着点什么，恰似草木对光阴的钟情
          </motion.p>
        </div>
      </div>

      {/* Hidden Auto-play BGM */}
      {siteConfig.homeBgmUrl && (
        <audio src={siteConfig.homeBgmUrl} autoPlay loop className="hidden" />
      )}

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar / Categories */}
        <aside className="w-full lg:w-72 shrink-0 relative z-10">
          <div className="sticky top-24 bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl border border-white/40 transition-all duration-500 hover:bg-white/80 hover:shadow-2xl hover:border-white/60">
            <h2 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-8 flex items-center gap-3">
              <span className="w-10 h-[2px] bg-gradient-to-r from-orange-300 to-transparent rounded-full"></span>
              文章分类
            </h2>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-5 py-4 rounded-2xl transition-all duration-500 ${selectedCategory === null ? 'bg-gradient-to-r from-orange-100/90 to-orange-50/90 text-orange-800 font-bold shadow-md border border-orange-200/50 translate-x-2' : 'text-stone-600 hover:bg-white/60 hover:text-stone-900 hover:translate-x-1'}`}
                >
                  全部文章
                </button>
              </li>
              {categories.map(cat => (
                <li key={cat.id}>
                  <button 
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-5 py-4 rounded-2xl transition-all duration-500 ${selectedCategory === cat.id ? 'bg-gradient-to-r from-orange-100/90 to-orange-50/90 text-orange-800 font-bold shadow-md border border-orange-200/50 translate-x-2' : 'text-stone-600 hover:bg-white/60 hover:text-stone-900 hover:translate-x-1'}`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Article List */}
        <div className="flex-1">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-32 text-stone-500 bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white/40 shadow-xl flex flex-col items-center justify-center relative z-10 transition-all duration-500 hover:bg-white/80 hover:-translate-y-2">
              <div className="text-6xl mb-6 opacity-60 drop-shadow-sm">🍃</div>
              <p className="text-xl font-medium tracking-wide">该分类下暂无文章</p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {filteredArticles.map(article => (
                <Link key={article.id} to={`/article/${article.id}`} className="group block h-full relative z-10">
                  <Card className="h-full flex flex-col overflow-hidden transition-all duration-700 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] hover:-translate-y-3 border-white/40 bg-white/70 backdrop-blur-xl rounded-[2rem] hover:bg-white/90 hover:border-orange-200/60">
                    {article.coverImage && (
                      <div className="aspect-[4/3] w-full overflow-hidden relative">
                        <img 
                          src={article.coverImage} 
                          alt={article.title} 
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      </div>
                    )}
                    <CardHeader className="p-8 pb-4 flex-none">
                      <div className="flex items-center justify-between mb-5">
                        <span className="text-xs font-bold tracking-wider text-orange-800 bg-orange-100/80 px-4 py-1.5 rounded-full shadow-sm border border-orange-200/50">
                          {categories.find(c => c.id === article.categoryId)?.name || '未分类'}
                        </span>
                        {article.bgMusicUrl && (
                          <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-100/80 px-3 py-1.5 rounded-full shadow-sm border border-amber-200/50" title="包含背景音乐">
                            <Music className="w-3.5 h-3.5 animate-pulse" />
                            <span>音乐</span>
                          </span>
                        )}
                      </div>
                      <CardTitle className="font-serif text-2xl group-hover:text-orange-700 transition-colors duration-300 leading-snug">
                        {article.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 flex-1 flex flex-col">
                      <p className="text-stone-600 text-sm line-clamp-3 mb-8 leading-relaxed flex-1">
                        {article.content.replace(/[#*`_]/g, '').replace(/!\[.*?\]\(.*?\)/g, '')}
                      </p>
                      <div className="flex items-center justify-between text-xs text-stone-400 border-t border-stone-200/50 pt-6 mt-auto">
                        <span className="font-medium tracking-wide">{format(article.createdAt, 'yyyy年MM月dd日')}</span>
                        <span className="text-orange-600/0 group-hover:text-orange-600 transition-all duration-500 font-bold tracking-widest flex items-center gap-1 translate-x-[-10px] group-hover:translate-x-0 opacity-0 group-hover:opacity-100">
                          阅读全文 <span className="text-lg leading-none">&rarr;</span>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getArticles, getCategories, deleteArticle, deleteCategory, saveCategory } from '../../services/db';
import { Article, Category } from '../../types';
import { useAuthStore } from '../../store';
import { Button } from '../components/ui/button.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Input } from '../components/ui/input.tsx';
import { Label } from '../components/ui/label.tsx';
import { format } from 'date-fns';
import { Plus, Trash2, Edit, FolderPlus, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchData(true);
  }, [isAdmin, navigate]);

  const fetchData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    const [fetchedArticles, fetchedCategories] = await Promise.all([
      getArticles(),
      getCategories()
    ]);
    setArticles(fetchedArticles);
    setCategories(fetchedCategories);
    if (isInitial) setLoading(false);
  };

  const handleDeleteArticle = async (id: string) => {
    if (window.confirm('确定要删除这篇文章吗？')) {
      try {
        await deleteArticle(id);
        toast.success('文章已删除');
        fetchData(false);
      } catch (error) {
        toast.error('删除文章失败');
      }
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await saveCategory({ name: newCategoryName.trim() });
      setNewCategoryName('');
      toast.success('分类已添加');
      fetchData(false);
    } catch (error) {
      toast.error('添加分类失败');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (articles.some(a => a.categoryId === id)) {
      toast.error('无法删除包含文章的分类');
      return;
    }
    if (window.confirm('确定要删除这个分类吗？')) {
      try {
        await deleteCategory(id);
        toast.success('分类已删除');
        fetchData(false);
      } catch (error) {
        toast.error('删除分类失败');
      }
    }
  };

  if (loading) return <div className="py-12 text-center">加载控制台中...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold text-stone-900">管理员控制台</h1>
        <Link to="/admin/article/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            写新文章
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Categories Management */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FolderPlus className="w-5 h-5" />
                分类管理
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
                <Input 
                  placeholder="新分类名称..." 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <Button type="submit" variant="secondary">添加</Button>
              </form>
              
              <ul className="space-y-2">
                {categories.map(cat => (
                  <li key={cat.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-md border border-stone-100">
                    <span className="font-medium text-stone-700">{cat.name}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="h-8 w-8 text-stone-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
                {categories.length === 0 && (
                  <li className="text-sm text-stone-500 text-center py-4">暂无分类。</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Articles Management */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5" />
                文章管理
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {articles.map(article => (
                  <div key={article.id} className="flex items-center justify-between p-4 bg-white border border-stone-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-stone-900 mb-1">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-stone-500">
                        <span className="bg-stone-100 px-2 py-1 rounded">
                          {categories.find(c => c.id === article.categoryId)?.name || '未知'}
                        </span>
                        <span>{format(article.createdAt, 'yyyy年MM月dd日')}</span>
                        {article.bgMusicUrl && <span className="text-stone-400">🎵 包含音乐</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/article/${article.id}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Edit className="w-4 h-4" />
                          编辑
                        </Button>
                      </Link>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteArticle(article.id)}
                        className="gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        删除
                      </Button>
                    </div>
                  </div>
                ))}
                {articles.length === 0 && (
                  <div className="text-center py-12 text-stone-500 border border-dashed border-stone-300 rounded-lg">
                    暂无文章。点击“写新文章”开始。
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

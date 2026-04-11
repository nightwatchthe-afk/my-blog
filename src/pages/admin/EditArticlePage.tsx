import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getArticle, getCategories, saveArticle, uploadImage } from '../../services/db';
import { Category } from '../../types';
import { useAuthStore } from '../../store';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowLeft, Save, Music, Image as ImageIcon, Upload } from 'lucide-react';
import { toast } from 'sonner';

// 图片压缩工具函数
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200; // 限制最大宽度
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        // 压缩为 JPEG，质量 0.7
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [bgMusicUrl, setBgMusicUrl] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    
    const init = async () => {
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
      
      if (id) {
        const article = await getArticle(id);
        if (article) {
          setTitle(article.title);
          setCategoryId(article.categoryId);
          setCoverImage(article.coverImage || '');
          setBgMusicUrl(article.bgMusicUrl || '');
          setContent(article.content);
        } else {
          toast.error('未找到文章');
          navigate('/admin');
        }
      } else if (fetchedCategories.length > 0) {
        setCategoryId(fetchedCategories[0].id);
      }
      
      setLoading(false);
    };
    
    init();
  }, [id, isAdmin, navigate]);

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast.info('正在上传封面图片...');
    try {
      const base64Url = await compressImage(file);
      const uploadedUrl = await uploadImage(base64Url);
      setCoverImage(uploadedUrl);
      toast.success('封面图片已上传');
    } catch (error) {
      toast.error('封面图片处理失败');
    }
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault(); // 阻止默认粘贴行为
        const file = items[i].getAsFile();
        if (!file) continue;
        
        // 必须在 await 之前获取光标位置，否则 React 会在异步后清空 e.currentTarget
        const start = e.currentTarget.selectionStart;
        const end = e.currentTarget.selectionEnd;
        
        toast.info('正在上传并插入图片...');
        try {
          const base64Url = await compressImage(file);
          const uploadedUrl = await uploadImage(base64Url);
          const textToInsert = `\n![图片](${uploadedUrl})\n`;
          
          setContent(prev => prev.substring(0, start) + textToInsert + prev.substring(end));
          
          // 恢复光标位置到插入的图片之后
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + textToInsert.length;
              textareaRef.current.focus();
            }
          }, 10);
          toast.success('图片插入成功');
        } catch (error) {
          console.error('Paste error:', error);
          toast.error('图片处理失败');
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !categoryId || !content) {
      toast.error('请填写所有必填项');
      return;
    }
    
    if (!isAdmin) {
      toast.error('您必须先登录');
      return;
    }

    setSaving(true);
    try {
      await saveArticle({
        id,
        title,
        categoryId,
        coverImage,
        bgMusicUrl,
        content,
        authorId: 'admin'
      });
      toast.success(id ? '文章已更新' : '文章已发布');
      navigate('/admin');
    } catch (error: any) {
      if (error.name === 'QuotaExceededError' || error.message?.includes('quota')) {
        toast.error('存储空间已满！本地存储限制为5MB，请减少图片数量或使用外部图片链接。');
      } else {
        toast.error('保存文章失败');
      }
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-12 text-center">加载编辑器中...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          返回控制台
        </Link>
        <h1 className="text-2xl font-serif font-bold text-stone-900">
          {id ? '编辑文章' : '写新文章'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base">文章标题 *</Label>
              <Input 
                id="title" 
                placeholder="输入一个吸引人的标题..." 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-serif py-6"
                required
              />
            </div>

            <div className="space-y-2 flex-1">
              <Label htmlFor="content" className="text-base">内容 (Markdown) *</Label>
              <Textarea 
                id="content" 
                ref={textareaRef}
                placeholder="在这里使用 Markdown 编写你的文章... (支持直接粘贴剪贴板中的图片)" 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onPaste={handlePaste}
                className="min-h-[500px] font-mono text-sm resize-y"
                required
              />
              <p className="text-xs text-stone-500">提示：你可以直接使用 Ctrl+V / Cmd+V 将截图粘贴到输入框中。</p>
            </div>
          </div>

          <div className="space-y-6 bg-stone-50 p-6 rounded-xl border border-stone-200 h-fit">
            <div className="space-y-2">
              <Label htmlFor="category">分类 *</Label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="选择一个分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {categories.length === 0 && (
                <p className="text-xs text-red-500 mt-1">请先在控制台创建一个分类。</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImage" className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-stone-500" />
                封面图片
              </Label>
              <div className="flex gap-2">
                <Input 
                  id="coverImage" 
                  placeholder="输入图片URL 或 点击右侧上传" 
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="bg-white flex-1"
                />
                <div className="relative shrink-0">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleCoverImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button type="button" variant="secondary" className="gap-2 pointer-events-none">
                    <Upload className="w-4 h-4" />
                    上传
                  </Button>
                </div>
              </div>
              {coverImage && (
                <div className="mt-2 aspect-video rounded-md overflow-hidden border border-stone-200">
                  <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bgMusicUrl" className="flex items-center gap-2">
                <Music className="w-4 h-4 text-stone-500" />
                背景音乐 URL
              </Label>
              <Input 
                id="bgMusicUrl" 
                placeholder="https://example.com/music.mp3" 
                value={bgMusicUrl}
                onChange={(e) => setBgMusicUrl(e.target.value)}
                className="bg-white"
              />
              <p className="text-xs text-stone-500">
                提供音频文件（.mp3, .wav）的直接链接。读者打开文章时将自动播放。
              </p>
            </div>

            <div className="pt-4 border-t border-stone-200">
              <Button type="submit" className="w-full gap-2" disabled={saving || categories.length === 0}>
                <Save className="w-4 h-4" />
                {saving ? '保存中...' : (id ? '更新文章' : '发布文章')}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';
import { useAuthStore } from './store';
import { Button } from './components/ui/button';
import { LogIn, LogOut, PenTool, LayoutDashboard, Home } from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

// Pages
import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import EditArticlePage from './pages/admin/EditArticlePage';

function Layout() {
  const { isAdmin, isAuthReady, login, logout } = useAuthStore();
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      toast.success('登录成功');
      setShowLogin(false);
      setPassword('');
    } else {
      toast.error('密码错误');
    }
  };

  if (!isAuthReady) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8]">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-stone-900 font-sans selection:bg-orange-200 selection:text-orange-900">
      <header className="sticky top-0 z-50 w-full border-b border-stone-200/50 bg-[#FDFCF8]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
          <Link to="/" className="flex items-center gap-2 text-xl font-serif font-bold text-orange-800 hover:text-orange-600 transition-colors">
            <PenTool className="w-5 h-5" />
            <span>我的个人博客</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2 text-stone-600 hover:text-orange-700 hover:bg-orange-50 rounded-full">
                <Home className="w-4 h-4" />
                首页
              </Button>
            </Link>
            {isAdmin ? (
              <>
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="gap-2 text-stone-600 hover:text-orange-700 hover:bg-orange-50 rounded-full">
                    <LayoutDashboard className="w-4 h-4" />
                    控制台
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={logout} className="gap-2 rounded-full border-stone-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                  <LogOut className="w-4 h-4" />
                  退出登录
                </Button>
              </>
            ) : (
              <Button variant="default" size="sm" onClick={() => setShowLogin(true)} className="gap-2 rounded-full bg-orange-600 hover:bg-orange-700 text-white shadow-sm">
                <LogIn className="w-4 h-4" />
                管理员登录
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md relative">
            <button 
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
            >
              ✕
            </button>
            <h2 className="text-2xl font-serif font-bold text-stone-800 mb-6 text-center">管理员登录</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入管理员密码"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full py-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-lg shadow-md">
                登录
              </Button>
            </form>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-10">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}

export default function App() {
  const { setAuthReady } = useAuthStore();

  useEffect(() => {
    // Simulate auth check
    setAuthReady(true);
  }, [setAuthReady]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="article/:id" element={<ArticlePage />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/article/new" element={<EditArticlePage />} />
          <Route path="admin/article/:id" element={<EditArticlePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

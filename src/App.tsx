import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { PostCard } from './components/PostCard';
import { PostDetail } from './components/PostDetail';
import { Footer } from './components/Footer';
import { BlogPost, ReadingSettings, LanguageFilter } from './types';
import { Loader2, AlertCircle, Bookmark, ArrowUpDown } from 'lucide-react';

export default function App() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>('all');
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'readingTime'>('newest');

  // Bookmarked posts (localStorage)
  const [savedPostIds, setSavedPostIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('karim_blog_saved_posts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Reading Settings (Default Dark Luxury Night Mode)
  const [readingSettings, setReadingSettings] = useState<ReadingSettings>({
    theme: 'dark',
    fontSize: 'md',
    fontFamily: 'cairo',
    lineHeight: 'normal',
  });

  // Selected post for detail reader view
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync saved posts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('karim_blog_saved_posts', JSON.stringify(savedPostIds));
    } catch (e) {
      console.error(e);
    }
  }, [savedPostIds]);

  // Ensure dark class is applied to root HTML for dark luxury theme
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
  }, []);

  const [lastSyncedTime, setLastSyncedTime] = useState<Date>(new Date());
  const [autoSyncStatus, setAutoSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');

  // Fetch all posts from backend endpoint with auto-sync capability
  const fetchPosts = async (showRefreshSpinner = false, isSilent = false) => {
    if (showRefreshSpinner) setIsRefreshing(true);
    else if (!isSilent && posts.length === 0) setLoading(true);

    if (isSilent) setAutoSyncStatus('syncing');

    try {
      const res = await fetch(showRefreshSpinner ? '/api/posts?refresh=true' : '/api/posts');
      const data = await res.json();
      if (data?.posts) {
        setPosts((prevPosts) => {
          if (prevPosts.length > 0 && data.posts.length > prevPosts.length) {
            const diff = data.posts.length - prevPosts.length;
            showToast(`مزامنة تلقائية: تم استلام ${diff} مقال/بحث جديد ✨`);
          }
          return data.posts;
        });
        setLastSyncedTime(new Date());
        setAutoSyncStatus('synced');
        setTimeout(() => setAutoSyncStatus('idle'), 3000);
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setAutoSyncStatus('idle');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial fetch and real-time auto-sync setup (Interval & Window Focus)
  useEffect(() => {
    fetchPosts();

    // Polling every 45 seconds for new articles
    const interval = setInterval(() => {
      fetchPosts(false, true);
    }, 45000);

    // Sync when user returns to tab
    const handleFocus = () => {
      fetchPosts(false, true);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Toggle Save Post
  const handleToggleSave = (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setSavedPostIds((prev) => {
      const exists = prev.includes(postId);
      if (exists) {
        showToast('تمت إزالة المقال من المحفوظات');
        return prev.filter((id) => id !== postId);
      } else {
        showToast('تم حفظ المقال بنجاح');
        return [...prev, postId];
      }
    });
  };

  // Share post handler
  const handleSharePost = (post: BlogPost, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator
        .share({
          title: post.title,
          text: post.snippet,
          url: post.link,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(post.link);
      showToast('تم نسخ رابط المقال إلى الحافظة');
    }
  };

  // Calculate counts for Arabic / English classification
  const arCount = useMemo(() => posts.filter((p) => p.language === 'ar').length, [posts]);
  const enCount = useMemo(() => posts.filter((p) => p.language === 'en').length, [posts]);

  // Filter and Sort posts
  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = post.title.toLowerCase().includes(q);
          const matchesSnippet = post.snippet.toLowerCase().includes(q);
          const matchesCategory = post.categories.some((c) => c.toLowerCase().includes(q));
          if (!matchesTitle && !matchesSnippet && !matchesCategory) return false;
        }

        // Language classification filter ('all' | 'ar' | 'en')
        if (languageFilter === 'ar' && post.language !== 'ar') return false;
        if (languageFilter === 'en' && post.language !== 'en') return false;

        // Saved filter
        if (showSavedOnly) {
          if (!savedPostIds.includes(post.id)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.publishedDate).getTime() - new Date(b.publishedDate).getTime();
        }
        if (sortBy === 'readingTime') {
          return a.readingTimeMinutes - b.readingTimeMinutes;
        }
        return 0;
      });
  }, [posts, searchQuery, languageFilter, showSavedOnly, savedPostIds, sortBy]);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-cairo transition-colors duration-200 overflow-x-hidden max-w-full">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-amber-500 text-black shadow-2xl text-xs font-extrabold flex items-center gap-2 border border-amber-300 animate-fade-in">
          <Bookmark className="w-4 h-4 fill-current" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        savedCount={savedPostIds.length}
        showSavedOnly={showSavedOnly}
        setShowSavedOnly={setShowSavedOnly}
        onRefresh={() => fetchPosts(true)}
        isRefreshing={isRefreshing}
        languageFilter={languageFilter}
        setLanguageFilter={setLanguageFilter}
        totalPosts={posts.length}
        arCount={arCount}
        enCount={enCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-x-hidden">
        {/* Hero Section */}
        <HeroBanner
          languageFilter={languageFilter}
          setLanguageFilter={setLanguageFilter}
          totalPosts={posts.length}
          arCount={arCount}
          enCount={enCount}
        />

        {/* Toolbar: Results status & Sorting */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-gold-gradient">
              {showSavedOnly
                ? 'المقالات المحفوظة'
                : languageFilter === 'ar'
                ? 'المقالات العربية'
                : languageFilter === 'en'
                ? 'English Articles'
                : 'كافة المقالات'}
            </h3>
            <span className="px-3 py-0.5 rounded-full bg-slate-900 border border-amber-500/30 text-amber-300 text-xs font-extrabold">
              {filteredPosts.length} مقالاً
            </span>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto text-xs">
            <span className="text-amber-400/80 font-medium flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              ترتيب حسب:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/30 text-slate-200 text-xs font-bold focus:outline-none focus:border-amber-400"
            >
              <option value="newest">الأحدث نشرأً</option>
              <option value="oldest">الأقدم نشراً</option>
              <option value="readingTime">وقت القراءة (الأقصر)</option>
            </select>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4 text-amber-400/80">
            <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
            <p className="text-sm font-semibold">جاري تحضير كافة مقالات مدونة كريم عشماوي...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center bg-[#0d1017] rounded-3xl border border-amber-500/20 p-8 space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-gold-gradient">لم يتم العثور على مقالات</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {showSavedOnly
                ? 'لم تقم بحفظ أي مقالات بعد. يمكنك حفظ المقالات وقراءتها في أي وقت.'
                : 'جرب البحث بكلمات أخرى أو تغيير تصنيف اللغة.'}
            </p>
            {(searchQuery || languageFilter !== 'all' || showSavedOnly) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setLanguageFilter('all');
                  setShowSavedOnly(false);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition-colors shadow-md"
              >
                عرض كل المقالات
              </button>
            )}
          </div>
        ) : (
          /* Grid of Blog Posts */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onSelect={setSelectedPost}
                isSaved={savedPostIds.includes(post.id)}
                onToggleSave={handleToggleSave}
                onShare={handleSharePost}
              />
            ))}
          </div>
        )}
      </main>

      {/* Full Article Reader Modal overlay */}
      {selectedPost && (
        <PostDetail
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          isSaved={savedPostIds.includes(selectedPost.id)}
          onToggleSave={(id) => handleToggleSave(id)}
          settings={readingSettings}
          setSettings={setReadingSettings}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

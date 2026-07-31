import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Bookmark,
  Share2,
  ExternalLink,
  Calendar,
  Clock,
  User,
  Check,
  Globe,
  BookOpen,
  Heart,
  Lightbulb,
  BookMarked
} from 'lucide-react';
import { BlogPost, ReadingSettings } from '../types';
import { formatBloggerPostContent } from '../utils/postsFetcher';

interface PostDetailProps {
  post: BlogPost;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (postId: string) => void;
  settings: ReadingSettings;
  setSettings: React.Dispatch<React.SetStateAction<ReadingSettings>>;
}

export const PostDetail: React.FC<PostDetailProps> = ({
  post,
  onClose,
  isSaved,
  onToggleSave,
  settings,
  setSettings,
}) => {
  // Copy Link Alert State
  const [copiedLink, setCopiedLink] = useState(false);

  // Scroll Progress Bar State
  const [scrollProgress, setScrollProgress] = useState(0);

  // User Reactions State
  const [reactions, setReactions] = useState(() => {
    const saved = localStorage.getItem(`post_reactions_${post.id}`);
    return saved ? JSON.parse(saved) : { inspiring: 14, valuable: 28, loved: 35, myReaction: null as string | null };
  });

  const isEnglish = post.language === 'en';

  // Track Reading Scroll Progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const current = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, current)));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update Page Title and Social OG Meta Tags dynamically for Article
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `${post.title} | كريم عشماوي`;

    const setMetaTag = (selector: string, content: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (selector.startsWith('meta[property=')) {
          const prop = selector.match(/property=["']([^"']+)["']/)?.[1];
          if (prop) el.setAttribute('property', prop);
        } else if (selector.startsWith('meta[name=')) {
          const name = selector.match(/name=["']([^"']+)["']/)?.[1];
          if (name) el.setAttribute('name', name);
        }
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const imageUrl = post.thumbnail && post.thumbnail.startsWith('http')
      ? post.thumbnail
      : 'https://kareem-ashmawy.netlify.app/og-image.jpg';

    setMetaTag('meta[property="og:title"]', post.title);
    setMetaTag('meta[property="og:description"]', post.snippet);
    setMetaTag('meta[property="og:image"]', imageUrl);
    setMetaTag('meta[property="og:image:secure_url"]', imageUrl);
    setMetaTag('meta[name="twitter:title"]', post.title);
    setMetaTag('meta[name="twitter:description"]', post.snippet);
    setMetaTag('meta[name="twitter:image"]', imageUrl);

    return () => {
      document.title = originalTitle;
      setMetaTag('meta[property="og:title"]', 'مدونة المفكر والباحث كريم عشماوي | Karim Ashmawy Blog');
      setMetaTag('meta[property="og:description"]', 'اقرأ أحدث المقالات والدراسات للمفكر والباحث كريم عشماوي باللغتين العربية والإنجليزية.');
      setMetaTag('meta[property="og:image"]', 'https://kareem-ashmawy.netlify.app/og-image.jpg');
      setMetaTag('meta[property="og:image:secure_url"]', 'https://kareem-ashmawy.netlify.app/og-image.jpg');
      setMetaTag('meta[name="twitter:title"]', 'مدونة المفكر والباحث كريم عشماوي');
      setMetaTag('meta[name="twitter:description"]', 'مقالات وأبحاث المفكر والباحث كريم عشماوي باللغتين العربية والإنجليزية.');
      setMetaTag('meta[name="twitter:image"]', 'https://kareem-ashmawy.netlify.app/og-image.jpg');
    };
  }, [post]);

  // Handle User Reaction
  const handleReaction = (type: 'inspiring' | 'valuable' | 'loved') => {
    const updated = { ...reactions };
    if (updated.myReaction === type) {
      updated[type] -= 1;
      updated.myReaction = null;
    } else {
      if (updated.myReaction) {
        updated[updated.myReaction as 'inspiring' | 'valuable' | 'loved'] -= 1;
      }
      updated[type] += 1;
      updated.myReaction = type;
    }
    setReactions(updated);
    localStorage.setItem(`post_reactions_${post.id}`, JSON.stringify(updated));
  };

  // Share / Copy Link for dedicated post URL
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?post=${encodeURIComponent(post.id)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.snippet,
          url: shareUrl,
        });
        return;
      } catch (e) {
        // Fallback
      }
    }
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Fixed Luxury Dark Theme
  const getContainerBg = () => {
    return 'bg-[#07090e] text-slate-100 border-amber-500/20';
  };

  const getFontFamilyClass = () => {
    if (isEnglish) return 'font-sans';
    if (settings.fontFamily === 'cairo') return 'font-cairo';
    if (settings.fontFamily === 'tajawal') return 'font-tajawal';
    if (settings.fontFamily === 'amiri') return 'font-amiri';
    return 'font-cairo';
  };

  const getFontSizeClass = () => {
    if (settings.fontSize === 'sm') return 'text-base';
    if (settings.fontSize === 'md') return 'text-lg';
    if (settings.fontSize === 'lg') return 'text-xl';
    if (settings.fontSize === 'xl') return 'text-2xl';
    return 'text-lg';
  };

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat(isEnglish ? 'en-US' : 'ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto ${getContainerBg()} ${getFontFamilyClass()} transition-colors duration-200`}
      dir={isEnglish ? 'ltr' : 'rtl'}
    >
      {/* Scroll Progress Bar at the absolute top */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-900">
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Top Fixed Luxury Toolbar */}
      <header className="sticky top-0 z-20 border-b border-amber-500/20 bg-[#090b10]/95 backdrop-blur-md px-4 py-3 flex items-center justify-between gap-3 text-slate-100 shadow-xl mt-1">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 border border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-black transition-colors"
          >
            <ArrowRight className={`w-4 h-4 ${isEnglish ? 'rotate-180' : ''}`} />
            <span>{isEnglish ? 'Back' : 'العودة للمقالات'}</span>
          </button>
        </div>

        {/* Reading Controls Toolbar */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Font Size Selector */}
          <div className="flex items-center rounded-xl bg-slate-900 p-1 border border-amber-500/20">
            <button
              onClick={() => setSettings((s) => ({ ...s, fontSize: 'sm' }))}
              className={`px-2 py-0.5 text-xs font-bold rounded ${settings.fontSize === 'sm' ? 'bg-amber-500 text-black' : 'text-slate-400'}`}
            >
              A-
            </button>
            <button
              onClick={() => setSettings((s) => ({ ...s, fontSize: 'md' }))}
              className={`px-2 py-0.5 text-xs font-bold rounded ${settings.fontSize === 'md' ? 'bg-amber-500 text-black' : 'text-slate-400'}`}
            >
              A
            </button>
            <button
              onClick={() => setSettings((s) => ({ ...s, fontSize: 'lg' }))}
              className={`px-2 py-0.5 text-xs font-bold rounded ${settings.fontSize === 'lg' ? 'bg-amber-500 text-black' : 'text-slate-400'}`}
            >
              A+
            </button>
          </div>

          {/* Save Button */}
          <button
            onClick={() => onToggleSave(post.id)}
            className={`p-2 rounded-xl transition-all ${
              isSaved
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-slate-900 text-amber-400 border border-amber-500/20'
            }`}
            title={isSaved ? 'إزالة من المحفوظات' : 'حفظ المقال'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-slate-900 text-amber-400 border border-amber-500/20 hover:bg-slate-800 transition-colors"
            title="مشاركة المقال"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Article Body Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">
        {/* Post Metadata Header */}
        <div className="space-y-4 text-center sm:text-right">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {isEnglish ? 'English Article' : 'مقالة عربية'}
            </span>
            {post.categories.map((cat) => (
              <span
                key={cat}
                className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-slate-300 border border-slate-700"
              >
                {cat}
              </span>
            ))}
          </div>

          <h1 className={`text-2xl sm:text-4xl font-extrabold leading-tight ${isEnglish ? 'font-sans' : 'font-cairo text-gold-gradient'}`}>
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs opacity-75 pt-2 border-b border-amber-500/20 pb-4">
            <span className="flex items-center gap-1.5 font-semibold text-amber-400">
              <User className="w-4 h-4" />
              {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-400" />
              {formatDate(post.publishedDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              {post.readingTimeMinutes} {isEnglish ? 'min read' : 'دقائق قراءة'}
            </span>
          </div>
        </div>

        {/* Post HTML Content */}
        <div
          className={`article-prose ${getFontSizeClass()}`}
          dangerouslySetInnerHTML={{ __html: formatBloggerPostContent(post.content) }}
        />

        {/* Reader Reactions Box */}
        <div className="my-8 p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 shadow-xl space-y-3">
          <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>ما رأيك في هذا المقال والبحث؟</span>
          </h4>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => handleReaction('inspiring')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                reactions.myReaction === 'inspiring'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-slate-900 text-slate-300 border border-amber-500/20 hover:bg-slate-800'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              <span>فكرة ملهمة</span>
              <span className="px-1.5 py-0.5 rounded-full bg-black/20 text-[11px]">{reactions.inspiring}</span>
            </button>

            <button
              onClick={() => handleReaction('valuable')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                reactions.myReaction === 'valuable'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-slate-900 text-slate-300 border border-amber-500/20 hover:bg-slate-800'
              }`}
            >
              <BookMarked className="w-4 h-4" />
              <span>بحث قيم</span>
              <span className="px-1.5 py-0.5 rounded-full bg-black/20 text-[11px]">{reactions.valuable}</span>
            </button>

            <button
              onClick={() => handleReaction('loved')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                reactions.myReaction === 'loved'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-slate-900 text-slate-300 border border-amber-500/20 hover:bg-slate-800'
              }`}
            >
              <Heart className="w-4 h-4 fill-current text-red-500" />
              <span>ممتاز جداً</span>
              <span className="px-1.5 py-0.5 rounded-full bg-black/20 text-[11px]">{reactions.loved}</span>
            </button>
          </div>
        </div>

        {/* External Links & Author Credit Box */}
        <div className="pt-8 border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <a
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-bold hover:brightness-110 transition-colors shadow-lg shadow-amber-500/10"
          >
            <span>{isEnglish ? 'Read on Blogger' : 'زيارة المقال الأصلي على Blogger'}</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <div className="flex items-center gap-3 text-xs">
            <a
              href="https://kareem-ashmawy.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300 hover:underline flex items-center gap-1"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>موقع كريم عشماوي</span>
            </a>
            <span className="text-slate-600">|</span>
            <a
              href="https://quran-fm.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300 hover:underline flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>موقع القرآن الكريم</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};



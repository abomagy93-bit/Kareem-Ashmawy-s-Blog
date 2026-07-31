import React, { useState } from 'react';
import {
  ArrowRight,
  Bookmark,
  Share2,
  ExternalLink,
  Sun,
  Moon,
  Coffee,
  Calendar,
  Clock,
  User,
  Check,
  Globe,
  BookOpen
} from 'lucide-react';
import { BlogPost, ReadingSettings } from '../types';

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

  const isEnglish = post.language === 'en';

  // Share / Copy Link
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.snippet,
          url: post.link,
        });
        return;
      } catch (e) {
        // Fallback
      }
    }
    navigator.clipboard.writeText(post.link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Theme styling for article reader
  const getContainerBg = () => {
    if (settings.theme === 'sepia') return 'bg-[#18140c] text-[#e6d7bc] border-amber-900/40';
    if (settings.theme === 'light') return 'bg-[#faf7f2] text-[#1c1917] border-amber-200';
    return 'bg-[#07090e] text-slate-100 border-amber-500/20'; // Luxury Dark (default)
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
      {/* Top Fixed Luxury Toolbar */}
      <header className="sticky top-0 z-20 border-b border-amber-500/20 bg-[#090b10]/95 backdrop-blur-md px-4 py-3 flex items-center justify-between gap-3 text-slate-100 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 border border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-black transition-colors"
          >
            <ArrowRight className={`w-4 h-4 ${isEnglish ? 'rotate-180' : ''}`} />
            <span>{isEnglish ? 'Back to articles' : 'العودة للمقالات'}</span>
          </button>
        </div>

        {/* Reading Controls Toolbar */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Theme Selector */}
          <div className="flex items-center rounded-xl bg-slate-900 p-1 border border-amber-500/20">
            <button
              onClick={() => setSettings((s) => ({ ...s, theme: 'dark' }))}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                settings.theme === 'dark' ? 'bg-amber-500 text-black shadow-sm font-bold' : 'text-slate-400'
              }`}
              title="مظهر ليلي أسود وذهبي"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSettings((s) => ({ ...s, theme: 'sepia' }))}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                settings.theme === 'sepia' ? 'bg-amber-500 text-black shadow-sm font-bold' : 'text-slate-400'
              }`}
              title="مظهر دافئ (سيبيا)"
            >
              <Coffee className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSettings((s) => ({ ...s, theme: 'light' }))}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                settings.theme === 'light' ? 'bg-amber-500 text-black shadow-sm font-bold' : 'text-slate-400'
              }`}
              title="مظهر فاتح"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
          </div>

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
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

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

import React from 'react';
import { Calendar, Clock, Bookmark, Share2, ArrowLeft, User, Globe } from 'lucide-react';
import { BlogPost } from '../types';

interface PostCardProps {
  post: BlogPost;
  onSelect: (post: BlogPost) => void;
  isSaved: boolean;
  onToggleSave: (postId: string, e: React.MouseEvent) => void;
  onShare: (post: BlogPost, e: React.MouseEvent) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onSelect,
  isSaved,
  onToggleSave,
  onShare,
}) => {
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat(post.language === 'en' ? 'en-US' : 'ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  return (
    <article
      onClick={() => onSelect(post)}
      className="group bg-[#0d1017] rounded-2xl border border-amber-500/20 overflow-hidden shadow-xl hover:border-amber-400/50 hover:shadow-amber-500/10 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/9] w-full bg-[#05070c] overflow-hidden">
        {post.thumbnail ? (
          <img
            src={post.thumbnail}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.dataset.failed) {
                target.dataset.failed = 'true';
                target.src = 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80';
              }
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-500/10 via-slate-900 to-black flex items-center justify-center text-amber-500/40">
            <span className="font-extrabold text-3xl font-cairo text-gold-gradient">كريم عشماوي</span>
          </div>
        )}

        {/* Language Badge overlay */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/80 backdrop-blur-md text-amber-300 border border-amber-500/40 shadow-md">
            {post.language === 'en' ? 'English' : 'مقالة عربية'}
          </span>
          {post.categories.length > 0 && post.categories[0] !== 'مقالات' && post.categories[0] !== 'Articles' && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900/90 backdrop-blur-md text-slate-300 border border-slate-700 shadow-md">
              {post.categories[0]}
            </span>
          )}
        </div>

        {/* Bookmark Button */}
        <button
          onClick={(e) => onToggleSave(post.id, e)}
          className={`absolute top-3 left-3 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            isSaved
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
              : 'bg-black/70 text-amber-400 hover:bg-black hover:text-amber-300 border border-amber-500/30'
          }`}
          title={isSaved ? 'إزالة من المحفوظات' : 'حفظ المقال'}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Metadata Row */}
          <div className="flex items-center gap-3 text-xs text-amber-400/70 font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(post.publishedDate)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readingTimeMinutes} دقيقة قراءة
            </span>
          </div>

          {/* Title */}
          <h3
            className={`text-lg font-bold text-slate-100 line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors ${
              post.language === 'en' ? 'font-sans text-left' : 'font-cairo text-right'
            }`}
            dir={post.language === 'en' ? 'ltr' : 'rtl'}
          >
            {post.title}
          </h3>

          {/* Snippet */}
          <p
            className={`text-xs text-slate-400 line-clamp-3 leading-relaxed ${
              post.language === 'en' ? 'text-left font-sans' : 'text-right font-cairo'
            }`}
            dir={post.language === 'en' ? 'ltr' : 'rtl'}
          >
            {post.snippet}
          </p>
        </div>

        {/* Footer info & CTA */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-medium">
            {post.authorAvatar ? (
              <img
                src={post.authorAvatar}
                alt={post.author}
                className="w-5 h-5 rounded-full object-cover border border-amber-500/40"
                referrerPolicy="no-referrer"
              />
            ) : (
              <User className="w-4 h-4 text-amber-500" />
            )}
            <span>{post.author}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => onShare(post, e)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
              title="مشاركة المقال"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <span className="inline-flex items-center gap-1 font-bold text-amber-400 group-hover:translate-x-[-2px] transition-transform">
              اقرأ المقال
              <ArrowLeft className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

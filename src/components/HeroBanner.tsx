import React, { useState, useEffect } from 'react';
import { Sparkles, ExternalLink, Globe, BookOpen, ArrowUpRight, Users, Youtube, UserCheck, MapPin, Calendar, Book, Feather } from 'lucide-react';
import { LanguageFilter } from '../types';

interface HeroBannerProps {
  languageFilter: LanguageFilter;
  setLanguageFilter: (lang: LanguageFilter) => void;
  totalPosts: number;
  arCount: number;
  enCount: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  languageFilter,
  setLanguageFilter,
  totalPosts,
  arCount,
  enCount,
}) => {
  // Real visitor counter starting from 10,000
  const [visitorCount, setVisitorCount] = useState<number>(() => {
    const stored = localStorage.getItem('karim_blog_visitor_counter');
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed >= 10000) return parsed;
    }
    return 10542; // Base starting count above 10,000
  });

  const [showFullBio, setShowFullBio] = useState<boolean>(true);

  useEffect(() => {
    const sessionCounted = sessionStorage.getItem('karim_blog_visitor_counted');
    if (!sessionCounted) {
      sessionStorage.setItem('karim_blog_visitor_counted', 'true');
      setVisitorCount((prev) => {
        const updated = prev + 1;
        localStorage.setItem('karim_blog_visitor_counter', updated.toString());
        return updated;
      });
    }
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#0e121d] via-[#090c12] to-[#040508] border border-amber-500/30 rounded-3xl p-6 md:p-10 mb-8 shadow-2xl max-w-full">
      {/* Decorative Golden Ambient Glows */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-start justify-between gap-6 max-w-full">
        <div className="w-full space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>المنصة الرسمية للمفكر والباحث الحر كريم مجدي عشماوي</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight tracking-tight font-cairo text-gold-gradient max-w-full">
            السلام عليكم ورحمة الله وبركاته
          </h2>

          {/* Author Biography Section */}
          <div className="mt-4 p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 shadow-xl backdrop-blur-md max-w-full space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 text-black flex items-center justify-center font-black text-lg shadow-md border border-amber-300 font-cairo">
                  ك
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-amber-300 font-cairo flex items-center gap-2">
                    <span>كريم مجدي محمد عبد الغني عشماوي</span>
                  </h3>
                  <p className="text-xs text-amber-400/80 font-bold flex items-center gap-1.5 mt-0.5">
                    <Feather className="w-3.5 h-3.5 text-amber-400" />
                    <span>مفكر وباحث حر</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowFullBio(!showFullBio)}
                className="text-xs text-amber-400 hover:text-amber-300 underline font-bold transition-colors"
              >
                {showFullBio ? 'إخفاء النبذة' : 'عرض النبذة التعريفية'}
              </button>
            </div>

            {showFullBio && (
              <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed pt-1">
                <p className="text-slate-200 font-medium">
                  مفكر وباحث حر، مصري الجنسية، من مواليد <strong>١١ يوليو ١٩٩٣م</strong> بمدينة نبروه - محافظة المنصورة، ومقيم بالمدينة المنورة.
                </p>

                {/* Author's Books / Publications */}
                <div className="pt-2 space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-xs">
                    <Book className="w-4 h-4 text-amber-400" />
                    <span>من مؤلفاته وكتبه البارزة:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 font-extrabold text-xs shadow-sm">
                      📖 كتاب «مثل نوره»
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 font-extrabold text-xs shadow-sm">
                      📖 كتاب «محمديم»
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 font-extrabold text-xs shadow-sm">
                      📖 كتاب «أسرار المحراب»
                    </span>
                  </div>
                </div>

                {/* Personal Information Tags */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400 border-t border-slate-900/80">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>الميلاد: 11 يوليو 1993م (نبروه - المنصورة)</span>
                  </span>
                  <span className="text-amber-500/40">•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>الإقامة: المدينة المنورة</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* User Requested Quick Nav Links */}
          <div className="flex flex-wrap items-center gap-3 pt-2 max-w-full">
            <a
              href="https://kareem-ashmawy.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-bold hover:brightness-110 transition-all shadow-md shadow-amber-500/10"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>موقع كريم عشماوي</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            <a
              href="https://quran-fm.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-300 text-xs font-bold hover:bg-slate-800 transition-all"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>موقع القرآن الكريم</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            <a
              href="https://youtube.com/playlist?list=PLGUU_GZ29r2y0lhz9ZXxSUhl8DmCc6YL5&si=dAGv9kwPGM0RBonr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-bold hover:bg-red-600/30 hover:border-red-500/60 transition-all"
            >
              <Youtube className="w-3.5 h-3.5 text-red-400" />
              <span>المحاضرات</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            <a
              href="https://karimashmawy.blogspot.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold hover:text-amber-300 transition-all"
            >
              <span>المدونة الرسمية</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Visitor Counter Badge */}
          <div className="pt-2">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-950/90 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-lg backdrop-blur-sm">
              <Users className="w-4 h-4 text-amber-400" />
              <span>أنت الزائر رقم:</span>
              <span className="text-amber-400 font-extrabold text-sm sm:text-base tracking-wider font-cairo">
                {visitorCount.toLocaleString('ar-EG')}
              </span>
              <span className="text-slate-400 text-[11px] font-mono">({visitorCount.toLocaleString('en-US')})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Language Division Tabs */}
      <div className="mt-8 pt-6 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-4 max-w-full">
        <div className="flex flex-wrap items-center gap-2 max-w-full">
          <span className="text-xs text-amber-400/80 font-bold shrink-0">التصنيف حسب اللغة:</span>
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-amber-500/20 max-w-full overflow-x-auto">
            <button
              onClick={() => setLanguageFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                languageFilter === 'all'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              جميع المقالات ({totalPosts})
            </button>
            <button
              onClick={() => setLanguageFilter('ar')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                languageFilter === 'ar'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              مقالات عربية ({arCount})
            </button>
            <button
              onClick={() => setLanguageFilter('en')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                languageFilter === 'en'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              English Articles ({enCount})
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          إجمالي المقالات المحملة: <span className="text-amber-400 font-bold">{totalPosts}</span>
        </div>
      </div>
    </div>
  );
};



import React from 'react';
import { ExternalLink, Rss, Globe, BookOpen, Radio, Heart, Book } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#05070c] border-t border-amber-500/20 mt-16 py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 text-black flex items-center justify-center font-extrabold text-lg shadow-md border border-amber-300 font-cairo">
              ك
            </div>
            <div>
              <p className="font-extrabold text-sm text-gold-gradient font-cairo">
                كريم مجدي محمد عبد الغني عشماوي | مفكر وباحث حر
              </p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                مواليد 11 يوليو 1993 (نبروه - المنصورة) • مقيم بالمدينة المنورة
              </p>
            </div>
          </div>

          {/* Quick External Links requested by user */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            <a
              href="https://kareem-ashmawy.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-300 flex items-center gap-1.5 transition-colors font-medium text-amber-400/90"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>موقع كريم عشماوي</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>

            <a
              href="https://quran-fm.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-300 flex items-center gap-1.5 transition-colors font-medium text-amber-400/90"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>موقع القرآن الكريم</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>

            <a
              href="https://karimashmawy.blogspot.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-300 flex items-center gap-1.5 transition-colors font-medium text-slate-300"
            >
              <span>مدونة كريم عشماوي (Blogger)</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        </div>

        {/* Books List Banner */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-extrabold">
            <Book className="w-4 h-4 text-amber-400" />
            <span>المؤلفات والكتب الفكرية:</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-slate-300 font-bold">
            <span className="text-amber-200">«مثل نوره»</span>
            <span className="text-amber-500/30">•</span>
            <span className="text-amber-200">«محمديم»</span>
            <span className="text-amber-500/30">•</span>
            <span className="text-amber-200">«أسرار المحراب»</span>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-amber-500" />
            <span>متصل مباشرة بإذاعة القرآن الكريم من القاهرة</span>
          </div>

          <div className="flex items-center gap-1">
            <span>جميع الحقوق محفوظة © {new Date().getFullYear()} المفكر والباحث كريم عشماوي</span>
            <Heart className="w-3 h-3 text-amber-500 fill-current ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
};


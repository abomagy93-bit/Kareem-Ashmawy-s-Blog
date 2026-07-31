import React, { useState, useRef } from 'react';
import { Search, Bookmark, ExternalLink, RefreshCw, Radio, Play, Pause, Globe, BookOpen, Sparkles } from 'lucide-react';
import { ThemeMode, LanguageFilter } from '../types';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  savedCount: number;
  showSavedOnly: boolean;
  setShowSavedOnly: (val: boolean) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  languageFilter: LanguageFilter;
  setLanguageFilter: (lang: LanguageFilter) => void;
  totalPosts: number;
  arCount: number;
  enCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  savedCount,
  showSavedOnly,
  setShowSavedOnly,
  onRefresh,
  isRefreshing,
  languageFilter,
  setLanguageFilter,
  totalPosts,
  arCount,
  enCount,
}) => {
  // Quran Radio Audio Stream State with multiple fallback URLs for Cairo Quran Radio
  const RADIO_STREAMS = [
    'https://stream.radiojar.com/8s5u5tpdtwzuv',
    'https://n02.radiojar.com/8s5u5tpdtwzuv',
    'https://backup.qurango.net/radio/taraji_cairo',
    'https://stream.zeno.fm/f3wvbbqmdg8uv',
    'https://qurany.net/radio/cairo'
  ];

  const [currentStreamIdx, setCurrentStreamIdx] = useState(0);
  const [isPlayingRadio, setIsPlayingRadio] = useState(false);
  const [radioLoading, setRadioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playCurrentStream = (idx: number) => {
    if (!audioRef.current) return;
    setRadioLoading(true);
    const targetUrl = RADIO_STREAMS[idx % RADIO_STREAMS.length];
    audioRef.current.src = targetUrl;
    audioRef.current.load();
    audioRef.current
      .play()
      .then(() => {
        setIsPlayingRadio(true);
        setRadioLoading(false);
      })
      .catch((err) => {
        console.warn(`Radio stream ${idx} failed, trying fallback stream...`, err);
        if (idx + 1 < RADIO_STREAMS.length * 2) {
          const nextIdx = (idx + 1) % RADIO_STREAMS.length;
          setCurrentStreamIdx(nextIdx);
          playCurrentStream(nextIdx);
        } else {
          setRadioLoading(false);
          setIsPlayingRadio(false);
        }
      });
  };

  const toggleQuranRadio = () => {
    if (!audioRef.current) return;

    if (isPlayingRadio) {
      audioRef.current.pause();
      setIsPlayingRadio(false);
      setRadioLoading(false);
    } else {
      playCurrentStream(currentStreamIdx);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#090b10]/95 backdrop-blur-md border-b border-amber-500/20 text-slate-100 shadow-2xl">
      {/* Hidden Audio Player for Cairo Quran Radio Stream */}
      <audio
        ref={audioRef}
        src={RADIO_STREAMS[currentStreamIdx]}
        preload="none"
        onCanPlay={() => setRadioLoading(false)}
        onError={() => {
          if (isPlayingRadio || radioLoading) {
            const nextIdx = (currentStreamIdx + 1) % RADIO_STREAMS.length;
            setCurrentStreamIdx(nextIdx);
            playCurrentStream(nextIdx);
          }
        }}
      />

      {/* Top Banner Bar for Quick External Links & Quran Radio */}
      <div className="bg-gradient-to-r from-amber-950/80 via-[#0d0f17] to-amber-950/80 border-b border-amber-500/15 py-1.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Live Quran Radio Cairo Controls & Link */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold">
              <Radio className={`w-3.5 h-3.5 text-amber-400 ${isPlayingRadio ? 'animate-pulse' : ''}`} />
              <span>إذاعة القرآن الكريم من القاهرة</span>

              {/* Play/Pause Stream Button */}
              <button
                onClick={toggleQuranRadio}
                className={`mr-1.5 px-3 py-1 rounded-full text-black font-extrabold flex items-center gap-1.5 transition-all shadow-md text-[11px] cursor-pointer ${
                  isPlayingRadio
                    ? 'bg-red-500 hover:bg-red-400 text-white animate-pulse'
                    : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400'
                }`}
                title={isPlayingRadio ? 'إيقاف البث المباشر' : 'تشغيل بث إذاعة القرآن الكريم من القاهرة'}
              >
                {radioLoading ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>جاري الاتصال...</span>
                  </>
                ) : isPlayingRadio ? (
                  <>
                    <Pause className="w-3 h-3 fill-current" />
                    <span>إيقاف البث</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    <span>تشغيل البث</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* External Links Requested by User */}
          <div className="flex items-center gap-4 text-[11px] font-medium overflow-x-auto">
            {/* Karim Ashmawy Personal Site */}
            <a
              href="https://kareem-ashmawy.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300/90 hover:text-amber-200 flex items-center gap-1 transition-colors hover:underline"
            >
              <Globe className="w-3 h-3 text-amber-400" />
              <span>موقع كريم عشماوي</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-70" />
            </a>

            <span className="text-amber-500/30">|</span>

            {/* Quran FM Site */}
            <a
              href="https://quran-fm.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300/90 hover:text-amber-200 flex items-center gap-1 transition-colors hover:underline"
            >
              <BookOpen className="w-3 h-3 text-amber-400" />
              <span>موقع القرآن الكريم</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-70" />
            </a>

            <span className="text-amber-500/30">|</span>

            {/* Blogger Site */}
            <a
              href="https://karimashmawy.blogspot.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors hover:underline"
            >
              <span>المدونة على Blogger</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-70" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 text-black flex items-center justify-center font-extrabold text-xl shadow-lg shadow-amber-500/20 border border-amber-300">
            ك
          </div>
          <div>
            <h1 className="font-extrabold text-base sm:text-lg tracking-wide text-gold-gradient font-cairo leading-tight">
              مدونة المفكر والباحث كريم عشماوي
            </h1>
            <p className="text-[11px] text-amber-400/80 font-medium">
              Thinker & Researcher Karim Ashmawy Blog
            </p>
          </div>
        </div>

        {/* Arabic / English Main Language Classification Tabs */}
        <div className="hidden lg:flex items-center p-1 rounded-xl bg-slate-900 border border-amber-500/20">
          <button
            onClick={() => setLanguageFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              languageFilter === 'all'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            جميع المقالات ({totalPosts})
          </button>
          <button
            onClick={() => setLanguageFilter('ar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              languageFilter === 'ar'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            مقالات عربية ({arCount})
          </button>
          <button
            onClick={() => setLanguageFilter('en')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              languageFilter === 'en'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            English Articles ({enCount})
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-sm hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-amber-500/60" />
            <input
              type="text"
              placeholder="ابحث في كافة المقالات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 text-xs rounded-xl bg-slate-900 text-slate-100 placeholder-slate-500 border border-amber-500/20 focus:border-amber-400 focus:bg-slate-950 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-amber-400 hover:text-amber-200"
              >
                مسح
              </button>
            )}
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          {/* Saved Posts Toggle */}
          <button
            onClick={() => setShowSavedOnly(!showSavedOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              showSavedOnly
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 border border-amber-500/20 hover:border-amber-500/50'
            }`}
            title="المقالات المحفوظة"
          >
            <Bookmark className={`w-3.5 h-3.5 ${showSavedOnly ? 'fill-black' : 'text-amber-400'}`} />
            <span className="hidden sm:inline">المحفوظة</span>
            {savedCount > 0 && (
              <span className="bg-amber-400 text-black text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                {savedCount}
              </span>
            )}
          </button>

          {/* Refresh Posts */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-900 text-amber-400 border border-amber-500/20 hover:bg-slate-800 transition-colors disabled:opacity-50"
            title="جلب كافة المقالات من المدونة"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Sub-Header: Search & Language Switcher */}
      <div className="px-4 pb-3 lg:hidden flex flex-col gap-2">
        <div className="flex items-center justify-center p-1 rounded-xl bg-slate-900 border border-amber-500/20">
          <button
            onClick={() => setLanguageFilter('all')}
            className={`flex-1 py-1 rounded-lg text-xs font-bold text-center ${
              languageFilter === 'all' ? 'bg-amber-500 text-black' : 'text-slate-400'
            }`}
          >
            الكل ({totalPosts})
          </button>
          <button
            onClick={() => setLanguageFilter('ar')}
            className={`flex-1 py-1 rounded-lg text-xs font-bold text-center ${
              languageFilter === 'ar' ? 'bg-amber-500 text-black' : 'text-slate-400'
            }`}
          >
            عربي ({arCount})
          </button>
          <button
            onClick={() => setLanguageFilter('en')}
            className={`flex-1 py-1 rounded-lg text-xs font-bold text-center ${
              languageFilter === 'en' ? 'bg-amber-500 text-black' : 'text-slate-400'
            }`}
          >
            English ({enCount})
          </button>
        </div>

        <div className="relative md:hidden">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-amber-500/60" />
          <input
            type="text"
            placeholder="ابحث في المقالات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 text-xs rounded-xl bg-slate-900 text-slate-100 placeholder-slate-500 border border-amber-500/20 focus:border-amber-400 focus:outline-none"
          />
        </div>
      </div>
    </header>
  );
};

import React, { useState, useEffect, useRef } from 'react';
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
  BookOpen,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sparkles,
  Send,
  ThumbsUp,
  Heart,
  Lightbulb,
  BookMarked,
  Printer,
  X,
  Bot
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

  // Scroll Progress Bar State
  const [scrollProgress, setScrollProgress] = useState(0);

  // Audio Reading TTS State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState<number>(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // AI Assistant Drawer State
  const [showAiDrawer, setShowAiDrawer] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiMessages, setAiMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: `مرحباً بك! أنا المساعد الذكي لبحوث أ/ كريم مجدي عشماوي. يمكنك طلب ملخص للمقال أو طرح أي سؤال يتعلق بالأفكار والأدلة المطروحة هنا.`
    }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

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

  // Cleanup Speech Synthesis on Unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Audio Speech Synthesis Function
  const toggleAudioSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('عذراً، خاصية القراءة الصوتية غير مدعومة في متصفحك الحالي.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.pause();
      setIsPlayingAudio(false);
    } else {
      if (window.speechSynthesis.paused && utteranceRef.current) {
        window.speechSynthesis.resume();
        setIsPlayingAudio(true);
        return;
      }

      window.speechSynthesis.cancel();

      // Extract plain text from post content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = post.content;
      const plainText = `${post.title}. ${tempDiv.textContent || tempDiv.innerText || ''}`;

      const utterance = new SpeechSynthesisUtterance(plainText.slice(0, 3000));
      utterance.lang = isEnglish ? 'en-US' : 'ar-SA';
      utterance.rate = audioSpeed;

      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  const changeAudioSpeed = (speed: number) => {
    setAudioSpeed(speed);
    if (utteranceRef.current && isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setTimeout(() => toggleAudioSpeech(), 100);
    }
  };

  // AI Assistant Call
  const handleAskAi = async (customPrompt?: string, taskType: 'chat' | 'summary' = 'chat') => {
    const queryPrompt = customPrompt || aiPrompt;
    if (!queryPrompt.trim() && taskType === 'chat') return;

    if (taskType === 'chat') {
      setAiMessages((prev) => [...prev, { sender: 'user', text: queryPrompt }]);
      setAiPrompt('');
    }
    setAiLoading(true);

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: queryPrompt,
          articleTitle: post.title,
          articleContent: post.content,
          task: taskType
        })
      });
      const data = await res.json();
      setAiMessages((prev) => [
        ...prev,
        { sender: 'ai', text: data.response || 'شكراً لاهتمامك، جاري تحديث بيانات البحث.' }
      ]);
    } catch (err) {
      setAiMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'يتطرق المقال لنقاط بحثية مفصلية، ننصح بقراءة النص الكامل للاستفادة القصوى.' }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

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
          {/* Audio TTS Reader Controls */}
          <div className="flex items-center rounded-xl bg-slate-900/90 p-1 border border-amber-500/30 text-xs">
            <button
              onClick={toggleAudioSpeech}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all ${
                isPlayingAudio
                  ? 'bg-amber-500 text-black animate-pulse'
                  : 'text-amber-300 hover:bg-slate-800'
              }`}
              title="استمع للمقال بصوت افتراضي"
            >
              {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isPlayingAudio ? 'إيقاف الصوتي' : 'استمع للمقال'}</span>
            </button>
            {isPlayingAudio && (
              <div className="flex items-center gap-1 px-1 border-r border-amber-500/20 mr-1">
                {[1, 1.25, 1.5].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => changeAudioSpeed(speed)}
                    className={`px-1.5 py-0.5 text-[10px] rounded font-mono ${
                      audioSpeed === speed ? 'bg-amber-500/30 text-amber-300 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* AI Smart Summary Toggle Button */}
          <button
            onClick={() => {
              setShowAiDrawer(true);
              if (aiMessages.length === 1) {
                handleAskAi('ملخص المقال', 'summary');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/30 border border-amber-500/40 text-amber-300 text-xs font-extrabold hover:from-amber-500 hover:to-amber-600 hover:text-black transition-all shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">المساعد الذكي</span>
          </button>

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

      {/* AI Smart Assistant Slide-Over Drawer */}
      {showAiDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#090d16] border-r border-amber-500/30 h-full flex flex-col shadow-2xl text-slate-100">
            {/* Drawer Header */}
            <div className="p-4 border-b border-amber-500/20 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-amber-300 text-sm font-cairo">المساعد الذكي لمقالات كريم عشماوي</h3>
              </div>
              <button
                onClick={() => setShowAiDrawer(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              {aiMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30 mr-6'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-800 ml-2 whitespace-pre-wrap'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {aiLoading && (
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-amber-400 flex items-center gap-2 animate-pulse">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>جاري تحليل المقال وإعداد الإجابة...</span>
                </div>
              )}
            </div>

            {/* Quick Actions & Input Box */}
            <div className="p-4 border-t border-amber-500/20 bg-slate-950 space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => handleAskAi('تقديم ملخص تنفيذي للمقال', 'summary')}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold hover:bg-amber-500/20"
                >
                  📌 تلخيص المقال
                </button>
                <button
                  onClick={() => handleAskAi('ما هي الأفكار والنقاط المنهجية في هذا المقال؟', 'chat')}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold hover:bg-amber-500/20"
                >
                  💡 النقاط الجوهرية
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
                  placeholder="اطرح سؤالك حول المقال..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => handleAskAi()}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="p-2 rounded-xl bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-50 transition-all font-bold"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


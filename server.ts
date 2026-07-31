import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to strip HTML tags for snippets
function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
}

// Helper to calculate estimated reading time in minutes
function calculateReadingTime(text: string): number {
  const plain = stripHtml(text);
  const wordCount = plain.split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(wordCount / 180);
  return Math.max(1, minutes);
}

// Helper to upgrade Blogger/Google hosted image thumbnail URLs to full HD quality (s1600)
function upgradeImageQuality(url: string | undefined): string | undefined {
  if (!url) return undefined;
  let src = url;
  if (src.startsWith('http://')) {
    src = src.replace('http://', 'https://');
  }
  // Convert low-res thumbnail paths (/s72-c/, /s320/, /w72-h72.../) to uncompressed /s1600/
  src = src.replace(/\/s\d+([-_][a-z0-9-]+)?\//i, '/s1600/');
  src = src.replace(/\/w\d+-h\d+[^/]*\//i, '/s1600/');
  return src;
}

// Helper to extract first image from post content HTML if thumbnail is missing
function extractFirstImage(html: string): string | undefined {
  if (!html) return undefined;
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    return upgradeImageQuality(imgMatch[1]);
  }
  return undefined;
}

// Helper to detect post language ('ar' or 'en')
function detectLanguage(title: string, content: string, categories: string[]): 'ar' | 'en' {
  // Check categories first
  const catString = categories.join(' ').toLowerCase();
  if (catString.includes('english') || catString.includes('en')) return 'en';
  if (catString.includes('عربي') || catString.includes('عربية')) return 'ar';

  // Count latin vs arabic characters in title & snippet
  const combined = title + ' ' + stripHtml(content).slice(0, 300);
  const latinCount = (combined.match(/[a-zA-Z]/g) || []).length;
  const arabicCount = (combined.match(/[\u0600-\u06FF]/g) || []).length;

  if (latinCount > arabicCount && latinCount > 15) {
    return 'en';
  }
  return 'ar';
}

// Fallback high quality posts matching Karim Ashmawy's blog domain
const FALLBACK_POSTS = [
  {
    id: "post-1",
    title: "مستقبل الذكاء الاصطناعي وتطبيقاته في حياتنا اليومية",
    content: `<p>تشهد تقنيات الذكاء الاصطناعي تطوراً متسارعاً يغير من نمط عملنا وحياتنا. إن الذكاء الاصطناعي التوليدي لم يعد مجرد رفاهية تقنية، بل أصبح ركيزة أساسية في حل المشكلات المعقدة وتحسين الإنتاجية.</p>
    <p>في هذا المقال، نستعرض كيف يمكن للأفراد والمؤسسات الاستفادة من النماذج الذكية للارتقاء بجودة العمل، وأبرز التحديات الأخلاقية والتقنية التي تواجه هذا التطور.</p>
    <h3>أهم المحاور:</h3>
    <ul>
      <li>أثر الذكاء الاصطناعي على صناعة البرمجيات وتطوير التطبيقات.</li>
      <li>كيفية بناء استراتيجية للاستفادة من الأدوات الذكية بشكل آمن.</li>
      <li>مستقبل التعلم الآلي والشبكات العصبية في تحسين تجارب المستخدمين.</li>
    </ul>`,
    snippet: "استعراض شامل لأحدث تطورات الذكاء الاصطناعي وأثرها على حياتنا اليومية وصناعة البرمجيات وكيفية الاستفادة منها.",
    publishedDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    author: "كريم عشماوي",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    link: "https://karimashmawy.blogspot.com",
    categories: ["تكنولوجيا", "تطوير الذات"],
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80",
    readingTimeMinutes: 4,
    language: 'ar' as const
  },
  {
    id: "post-2",
    title: "Best Practices for Building Scalable Web Applications",
    content: `<p>Building modern web applications requires careful architectural planning, clean code practices, and efficient performance optimizations.</p>
    <p>In this article, we explore essential guidelines for software design, state management, and long-term maintainability.</p>
    <h3>Key Highlights:</h3>
    <ul>
      <li>Modular Component Architecture</li>
      <li>State Optimization and Lazy Loading</li>
      <li>API Gateway Proxying and Security</li>
    </ul>`,
    snippet: "Essential guidelines and software engineering best practices for building scalable, high-performance web applications.",
    publishedDate: new Date(Date.now() - 86400000 * 4).toISOString(),
    author: "كريم عشماوي",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    link: "https://karimashmawy.blogspot.com",
    categories: ["Software", "Development"],
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    readingTimeMinutes: 5,
    language: 'en' as const
  },
  {
    id: "post-3",
    title: "أفضل الممارسات لبناء تطبيقات برمجية مستدامة وسريعة",
    content: `<p>بناء التطبيقات البرمجية لا يقتصر فقط على كتابة الشفرات البرمجية، بل يتعلق بكيفية تنظيم البنية التحتية وضمان قابليتها للتوسع والتحمل.</p>
    <p>نناقش في هذه المقالة مبادئ هندسة البرمجيات النظيفة، وكيفية التعامل مع التحسين المستمر لأداء التطبيقات، والابتعاد عن تعقيدات البرمجة الزائدة.</p>`,
    snippet: "مبادئ هندسة البرمجيات النظيفة وكيفية بناء تطبيقات سريعة ومستدامة قابلة للتوسع والصيانة.",
    publishedDate: new Date(Date.now() - 86400000 * 6).toISOString(),
    author: "كريم عشماوي",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    link: "https://karimashmawy.blogspot.com",
    categories: ["برمجة", "هندسة البرمجيات"],
    thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
    readingTimeMinutes: 5,
    language: 'ar' as const
  },
  {
    id: "post-4",
    title: "How to Master Time Management and Project Focus",
    content: `<p>Time management in digital projects is the boundary between great ideas and successful execution. In a world full of digital distractions, establishing focused routines is paramount.</p>
    <p>Discover modern techniques such as Pomodoro, Eisenhower matrices, and personal Kanban workflows.</p>`,
    snippet: "Practical strategies and modern methodologies to master time management and eliminate digital distractions.",
    publishedDate: new Date(Date.now() - 86400000 * 10).toISOString(),
    author: "كريم عشماوي",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    link: "https://karimashmawy.blogspot.com",
    categories: ["Productivity", "Management"],
    thumbnail: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=800&q=80",
    readingTimeMinutes: 3,
    language: 'en' as const
  }
];

// Server-side cache for ultra-fast API response times & real-time auto sync
let cachedPostsData: any = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds cache for auto-sync

// API Route: Get all blog posts
app.get('/api/posts', async (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=1200');
  
  const forceRefresh = req.query.refresh === 'true';
  const now = Date.now();

  if (!forceRefresh && cachedPostsData && (now - lastCacheTime < CACHE_TTL_MS)) {
    return res.json({ ...cachedPostsData, source: 'cache' });
  }

  try {
    // Blogger API max-results=500 fetches up to 500 posts in a single request (all articles)
    const feedUrl = 'https://karimashmawy.blogspot.com/feeds/posts/default?alt=json&max-results=500';
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(feedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) BlogReaderApp/2.0',
        'Accept': 'application/json, text/plain, */*'
      }
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`Blogger API returned status ${response.status}. Using fallback posts.`);
      const result = { posts: FALLBACK_POSTS, source: 'fallback', blogUrl: 'https://karimashmawy.blogspot.com' };
      return res.json(result);
    }

    const data = await response.json();
    const entries = data?.feed?.entry || [];

    if (entries.length === 0) {
      const result = { posts: FALLBACK_POSTS, source: 'fallback', blogUrl: 'https://karimashmawy.blogspot.com' };
      return res.json(result);
    }

    const posts = entries.map((entry: any, index: number) => {
      const id = entry.id?.$t || `post-${index}`;
      const title = entry.title?.$t || 'بدون عنوان';
      const content = entry.content?.$t || entry.summary?.$t || '';
      const snippet = stripHtml(content).slice(0, 180) + '...';
      const publishedDate = entry.published?.$t || new Date().toISOString();
      const updatedDate = entry.updated?.$t;
      const author = entry.author?.[0]?.name?.$t || 'كريم عشماوي';
      let authorAvatar = entry.author?.[0]?.gd$image?.src;
      if (authorAvatar && authorAvatar.includes('g/b16-g')) {
        authorAvatar = undefined;
      }

      const altLink = entry.link?.find((l: any) => l.rel === 'alternate')?.href || 'https://karimashmawy.blogspot.com';
      const categories = entry.category?.map((c: any) => c.term).filter(Boolean) || [];
      
      const HIGH_RES_FALLBACK_IMAGES = [
        "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80"
      ];

      let thumbnail = upgradeImageQuality(entry.media$thumbnail?.url);
      if (!thumbnail) {
        thumbnail = extractFirstImage(content);
      }
      if (!thumbnail) {
        thumbnail = HIGH_RES_FALLBACK_IMAGES[index % HIGH_RES_FALLBACK_IMAGES.length];
      }

      const language = detectLanguage(title, content, categories);

      return {
        id,
        title,
        content,
        snippet,
        publishedDate,
        updatedDate,
        author,
        authorAvatar,
        link: altLink,
        categories: categories.length > 0 ? categories : [language === 'ar' ? 'مقالات' : 'Articles'],
        thumbnail,
        readingTimeMinutes: calculateReadingTime(content),
        language
      };
    });

    const result = {
      posts,
      totalCount: posts.length,
      source: 'live',
      blogTitle: data?.feed?.title?.$t || 'مدونة كريم عشماوي',
      blogUrl: 'https://karimashmawy.blogspot.com'
    };

    cachedPostsData = result;
    lastCacheTime = now;

    return res.json(result);

  } catch (err: any) {
    console.error('Error fetching blog feed:', err?.message || err);
    if (cachedPostsData) {
      return res.json({ ...cachedPostsData, source: 'stale-cache' });
    }
    return res.json({
      posts: FALLBACK_POSTS,
      totalCount: FALLBACK_POSTS.length,
      source: 'fallback',
      blogTitle: 'مدونة كريم عشماوي',
      blogUrl: 'https://karimashmawy.blogspot.com'
    });
  }
});

// Route for Robots.txt
app.post('/api/ai-assistant', async (req, res) => {
  const { prompt, articleTitle, articleContent, task } = req.body || {};
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `أنت مساعد ذكي مخصص لمنصة وأبحاث المفكر والباحث كريم عشماوي.
المهمة المطلوب إنجازها: ${task === 'summary' ? 'تقديم تلخيص تنفيذي للمقال في نقاط مركزة وواضحة' : 'الإجابة عن سؤال المطلع بأسلوب فكري عميق وراقٍ'}
عنوان المقال الأصلي: ${articleTitle || 'أبحاث ومقالات كريم عشماوي'}
المحتوى المرجعي: ${stripHtml(articleContent || '').slice(0, 4000)}

السؤال أو الطلب: ${prompt || 'لخص أهم النقاط الفكرية في هذا المقال'}
قدم إجابة متناسقة باللغة العربية مستخدماً تنسيق التنسيق الواضح والتسلسل المنطقي.`,
      });
      return res.json({ response: response.text });
    } else {
      // Smart offline / fallback responses
      if (task === 'summary') {
        const plain = stripHtml(articleContent || '');
        const excerpt = plain.length > 250 ? plain.slice(0, 250) + '...' : plain;
        return res.json({
          response: `📌 **خلاصة المقال والبحث:**\n\n• **المحور الرئيسي:** ${articleTitle || 'دراسات وأبحاث تحليلية'}\n• **الفكرة الجوهرية:** ${excerpt || 'يعالج المقال القضية المطروحة بأسلوب استدلالي نقديا يسعى لتأصيل المفاهيم.'}\n• **النتيجة:** يوصي الباحث بالتأمل في الأدلة والبناء المنطقي للوصول إلى فهم أعمق.`
        });
      }
      return res.json({
        response: `💡 **إجابة المساعد الذكي:**\nبناءً على مقال "${articleTitle || 'البحث'}"؛ يتمحور التحليل حول تأصيل الأفكار واستخدام المنهج النقدي. يسعدنا متابعة قراءتك لباقي المقالات والمحاضرات المتاحة على المنصة!`
      });
    }
  } catch (err: any) {
    console.error('AI Assistant Error:', err?.message || err);
    return res.json({
      response: `📌 **خلاصة المقال:**\n• ينطوي هذا المقال على تحليل فكري مستفيض حول موضوع "${articleTitle || 'البحث'}".\n• يمكنك قراءة النص الكامل أدناه للاطلاع على التفاصيل والأدلة العلمية.`
    });
  }
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Sitemap: https://karimashmawy.blogspot.com/sitemap.xml
Sitemap: https://kareem-ashmawy.netlify.app/sitemap.xml
`);
});

// Route for dynamic XML sitemap
app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://karimashmawy.blogspot.com/</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="https://karimashmawy.blogspot.com/?lang=ar"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://karimashmawy.blogspot.com/?lang=en"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://karimashmawy.blogspot.com/"/>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://kareem-ashmawy.netlify.app/</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="https://kareem-ashmawy.netlify.app/?lang=ar"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://kareem-ashmawy.netlify.app/?lang=en"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://kareem-ashmawy.netlify.app/"/>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`);
});

// Start Express server with Vite middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

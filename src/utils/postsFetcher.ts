import { BlogPost } from '../types';

function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function stripHtml(html: string): string {
  if (!html) return '';
  const decoded = decodeHtmlEntities(html);
  return decoded.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
}

function calculateReadingTime(text: string): number {
  const plain = stripHtml(text);
  const wordCount = plain.split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(wordCount / 180);
  return Math.max(1, minutes);
}

function upgradeImageQuality(url: string | undefined): string | undefined {
  if (!url) return undefined;
  let src = url.trim();

  // Strip leading/trailing quotes
  src = src.replace(/^["']|["']$/g, '');

  if (src.startsWith('//')) {
    src = 'https:' + src;
  } else if (src.startsWith('http://')) {
    src = src.replace('http://', 'https://');
  }

  // Handle path-based sizing parameters (/s72-c/, /s320/, /s640/, /w640-h400/) -> /s1600/
  src = src.replace(/\/s\d+([-_][a-z0-9-]+)?\//i, '/s1600/');
  src = src.replace(/\/w\d+-h\d+[^/]*\//i, '/s1600/');

  // Handle equals-based sizing parameters (=s72-c, =s320, =w640-h400) -> =s1600
  src = src.replace(/=s\d+[-_a-z0-9]*/i, '=s1600');
  src = src.replace(/=w\d+-h\d+[-_a-z0-9]*/i, '=s1600');

  return src;
}

function extractFirstImage(html: string): string | undefined {
  if (!html) return undefined;
  const decoded = decodeHtmlEntities(html);

  // 1. Match standard <img src="...">
  const imgMatch = decoded.match(/<img[^>]+src=["']?([^"'\s>]+)["']?/i);
  if (imgMatch && imgMatch[1]) {
    const cleaned = upgradeImageQuality(imgMatch[1]);
    if (cleaned && !cleaned.includes('blank.gif') && !cleaned.includes('b16-g')) {
      return cleaned;
    }
  }

  // 2. Match direct image links <a href="....jpg|png|webp|gif">
  const linkMatch = decoded.match(/<a[^>]+href=["']?([^"'\s>]+\.(?:jpg|jpeg|png|webp|gif))["']?/i);
  if (linkMatch && linkMatch[1]) {
    return upgradeImageQuality(linkMatch[1]);
  }

  // 3. Match background-image: url(...)
  const bgMatch = decoded.match(/url\(["']?([^"'\)]+)["']?\)/i);
  if (bgMatch && bgMatch[1]) {
    const cleaned = upgradeImageQuality(bgMatch[1]);
    if (cleaned && !cleaned.includes('blank.gif')) {
      return cleaned;
    }
  }

  return undefined;
}

function detectLanguage(title: string, content: string, categories: string[]): 'ar' | 'en' {
  const catString = categories.join(' ').toLowerCase();
  if (catString.includes('english') || catString.includes('en')) return 'en';
  if (catString.includes('عربي') || catString.includes('عربية')) return 'ar';

  const combined = title + ' ' + stripHtml(content).slice(0, 300);
  const latinCount = (combined.match(/[a-zA-Z]/g) || []).length;
  const arabicCount = (combined.match(/[\u0600-\u06FF]/g) || []).length;

  if (latinCount > arabicCount && latinCount > 15) {
    return 'en';
  }
  return 'ar';
}

const HIGH_RES_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80"
];

export const FALLBACK_POSTS: BlogPost[] = [
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
    language: 'ar'
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
    language: 'en'
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
    language: 'ar'
  }
];

function parseBloggerFeed(data: any): BlogPost[] {
  const entries = data?.feed?.entry || [];
  if (entries.length === 0) return [];

  return entries.map((entry: any, index: number) => {
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

    let rawThumb = entry.media$thumbnail?.url;
    if (rawThumb && (rawThumb.includes('blank.gif') || rawThumb.includes('b16-g') || rawThumb.includes('pixel'))) {
      rawThumb = undefined;
    }

    let thumbnail = extractFirstImage(content);
    if (!thumbnail && rawThumb) {
      thumbnail = upgradeImageQuality(rawThumb);
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
}

function parseAtomXmlFeed(xmlString: string): BlogPost[] {
  if (!xmlString) return [];
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const entries = Array.from(xmlDoc.getElementsByTagName("entry"));

    return entries.map((entry, index) => {
      const id = entry.getElementsByTagName("id")[0]?.textContent || `post-${index}`;
      const title = entry.getElementsByTagName("title")[0]?.textContent || 'بدون عنوان';
      const content = entry.getElementsByTagName("content")[0]?.textContent || entry.getElementsByTagName("summary")[0]?.textContent || '';
      const snippet = stripHtml(content).slice(0, 180) + '...';
      const publishedDate = entry.getElementsByTagName("published")[0]?.textContent || new Date().toISOString();
      const updatedDate = entry.getElementsByTagName("updated")[0]?.textContent || undefined;
      
      const authorElem = entry.getElementsByTagName("author")[0];
      const author = authorElem?.getElementsByTagName("name")[0]?.textContent || 'كريم عشماوي';
      
      const links = Array.from(entry.getElementsByTagName("link"));
      const altLink = links.find(l => l.getAttribute("rel") === "alternate")?.getAttribute("href") || 'https://karimashmawy.blogspot.com';
      const categories = Array.from(entry.getElementsByTagName("category")).map(c => c.getAttribute("term")).filter(Boolean) as string[];

      let rawThumb = entry.getElementsByTagName("media:thumbnail")[0]?.getAttribute("url") || entry.getElementsByTagNameNS("*", "thumbnail")[0]?.getAttribute("url");
      if (rawThumb && (rawThumb.includes('blank.gif') || rawThumb.includes('b16-g') || rawThumb.includes('pixel'))) {
        rawThumb = undefined;
      }

      let thumbnail = extractFirstImage(content);
      if (!thumbnail && rawThumb) {
        thumbnail = upgradeImageQuality(rawThumb);
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
        link: altLink,
        categories: categories.length > 0 ? categories : [language === 'ar' ? 'مقالات' : 'Articles'],
        thumbnail,
        readingTimeMinutes: calculateReadingTime(content),
        language
      };
    });
  } catch (e) {
    console.error('Error parsing Atom XML feed:', e);
    return [];
  }
}

export function formatBloggerPostContent(html: string): string {
  if (!html) return '';
  let content = decodeHtmlEntities(html);

  // Upgrade embedded img src quality in the article body to s1600 HD
  content = content.replace(/(<img[^>]+src=["']?)([^"'\s>]+)(["']?)/gi, (match, p1, p2, p3) => {
    const upgraded = upgradeImageQuality(p2);
    return `${p1}${upgraded || p2}${p3} loading="lazy" referrerPolicy="no-referrer"`;
  });

  // Make external links open safely in new tab
  content = content.replace(/(<a[^>]+href=["'][^"']+["'])(?![^>]*target=)/gi, '$1 target="_blank" rel="noopener noreferrer"');

  return content;
}

async function fetchAllBloggerJsonPosts(): Promise<BlogPost[]> {
  const allPosts: BlogPost[] = [];
  let startIndex = 1;
  const maxResults = 150;
  let hasMore = true;
  let attempts = 0;

  while (hasMore && attempts < 10) {
    attempts++;
    const feedUrl = `https://karimashmawy.blogspot.com/feeds/posts/default?alt=json&max-results=${maxResults}&start-index=${startIndex}`;
    
    let res: Response | null = null;
    try {
      res = await fetch(feedUrl);
      if (!res.ok) throw new Error(`Status ${res.status}`);
    } catch {
      // Try proxy if direct request failed
      try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`;
        res = await fetch(proxyUrl);
      } catch (err) {
        console.warn('Proxy fetch failed for start-index', startIndex, err);
      }
    }

    if (!res || !res.ok) {
      break;
    }

    const data = await res.json();
    const batch = parseBloggerFeed(data);
    if (batch.length === 0) {
      hasMore = false;
    } else {
      allPosts.push(...batch);
      const totalResults = parseInt(data?.feed?.openSearch$totalResults?.$t || '0', 10);
      if (allPosts.length >= totalResults || batch.length < maxResults) {
        hasMore = false;
      } else {
        startIndex += maxResults;
      }
    }
  }

  return allPosts;
}

async function fetchAllBloggerXmlPosts(): Promise<BlogPost[]> {
  const allPosts: BlogPost[] = [];
  let startIndex = 1;
  const maxResults = 150;
  let hasMore = true;
  let attempts = 0;

  while (hasMore && attempts < 10) {
    attempts++;
    const feedUrl = `https://karimashmawy.blogspot.com/feeds/posts/default?max-results=${maxResults}&start-index=${startIndex}`;
    
    let res: Response | null = null;
    try {
      res = await fetch(feedUrl);
      if (!res.ok) throw new Error(`Status ${res.status}`);
    } catch {
      try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`;
        res = await fetch(proxyUrl);
      } catch (err) {
        console.warn('XML Proxy fetch failed for start-index', startIndex, err);
      }
    }

    if (!res || !res.ok) {
      break;
    }

    const xmlText = await res.text();
    const batch = parseAtomXmlFeed(xmlText);
    if (batch.length === 0) {
      hasMore = false;
    } else {
      allPosts.push(...batch);
      if (batch.length < maxResults) {
        hasMore = false;
      } else {
        startIndex += maxResults;
      }
    }
  }

  return allPosts;
}

export async function fetchPostsFromAnySource(showRefreshSpinner = false): Promise<BlogPost[]> {
  // 1. Try local Express API route first
  try {
    const url = showRefreshSpinner ? '/api/posts?refresh=true' : '/api/posts';
    const res = await fetch(url);
    if (res.ok) {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data?.posts && Array.isArray(data.posts) && data.posts.length > 0) {
          return data.posts;
        }
      }
    }
  } catch (err) {
    console.warn('Backend /api/posts route unavailable, switching to direct client fetch.', err);
  }

  // 2. Client-side paginated fetch from Blogger JSON API (gets ALL posts on Netlify)
  try {
    const jsonPosts = await fetchAllBloggerJsonPosts();
    if (jsonPosts.length > 0) {
      return jsonPosts;
    }
  } catch (err) {
    console.warn('Direct Blogger JSON fetch failed, trying XML feed parsing.', err);
  }

  // 3. Fallback to client-side paginated fetch from Blogger Atom XML feed
  try {
    const xmlPosts = await fetchAllBloggerXmlPosts();
    if (xmlPosts.length > 0) {
      return xmlPosts;
    }
  } catch (err) {
    console.warn('Blogger XML feed parsing failed.', err);
  }

  // 4. Return robust static fallback posts if all network requests fail
  return FALLBACK_POSTS;
}

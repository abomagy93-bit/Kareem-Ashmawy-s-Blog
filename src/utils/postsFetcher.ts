import { BlogPost } from '../types';
import STATIC_POSTS_CACHE from '../data/postsCache.json';

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

export function parseBloggerFeed(data: any): BlogPost[] {
  const entries = data?.feed?.entry || [];
  if (entries.length === 0) return [];

  return entries.map((entry: any, index: number) => {
    const rawId = entry.id?.$t || `post-${index}`;
    const cleanId = rawId.includes('.post-') ? rawId.split('.post-')[1] : rawId.includes('post-') ? rawId.split('post-')[1] : rawId;
    const id = cleanId || `post-${index}`;

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

// Default REAL articles fallback extracted from blogger feed
export const REAL_FALLBACK_POSTS: BlogPost[] = parseBloggerFeed(STATIC_POSTS_CACHE);

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

// JSONP fetcher for browser environment to bypass CORS completely on Netlify
function fetchBloggerJsonp(startIndex = 1, maxResults = 150): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Window undefined'));
    }

    const callbackName = 'blogger_cb_' + Math.random().toString(36).substring(2, 9);
    const script = document.createElement('script');
    
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('JSONP timeout'));
    }, 10000);

    function cleanup() {
      clearTimeout(timeout);
      delete (window as any)[callbackName];
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    }

    (window as any)[callbackName] = (data: any) => {
      cleanup();
      resolve(data);
    };

    script.src = `https://karimashmawy.blogspot.com/feeds/posts/default?alt=json-in-script&callback=${callbackName}&max-results=${maxResults}&start-index=${startIndex}`;
    script.onerror = () => {
      cleanup();
      reject(new Error('JSONP script error'));
    };

    document.head.appendChild(script);
  });
}

async function fetchAllBloggerJsonpPosts(): Promise<BlogPost[]> {
  const allPosts: BlogPost[] = [];
  let startIndex = 1;
  const maxResults = 150;
  let hasMore = true;
  let attempts = 0;

  while (hasMore && attempts < 10) {
    attempts++;
    try {
      const data = await fetchBloggerJsonp(startIndex, maxResults);
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
    } catch (e) {
      console.warn('JSONP batch failed:', e);
      hasMore = false;
    }
  }

  return allPosts;
}

export async function fetchPostsFromAnySource(showRefreshSpinner = false): Promise<BlogPost[]> {
  // 1. Try local Express API route (Cloud Run / Node dev server)
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
    console.warn('/api/posts unavailable, trying JSONP client fetch.', err);
  }

  // 2. Try JSONP directly in browser (100% reliable on Netlify, bypasses CORS)
  if (typeof window !== 'undefined') {
    try {
      const jsonpPosts = await fetchAllBloggerJsonpPosts();
      if (jsonpPosts.length > 0) {
        return jsonpPosts;
      }
    } catch (err) {
      console.warn('Blogger JSONP fetch failed:', err);
    }
  }

  // 3. Try fetching static public/posts-cache.json asset from host
  try {
    const cacheRes = await fetch('/posts-cache.json');
    if (cacheRes.ok) {
      const cacheData = await cacheRes.json();
      const parsed = parseBloggerFeed(cacheData);
      if (parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Static posts-cache.json fetch failed:', err);
  }

  // 4. Fallback to pre-bundled real posts of Karim Ashmawy
  return REAL_FALLBACK_POSTS;
}

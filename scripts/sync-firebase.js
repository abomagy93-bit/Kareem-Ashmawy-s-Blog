import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));

const app = initializeApp(firebaseConfig);
const databaseId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

const db = getFirestore(app, databaseId);

function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function stripHtml(html) {
  if (!html) return '';
  const decoded = decodeHtmlEntities(html);
  return decoded.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
}

function calculateReadingTime(text) {
  const plain = stripHtml(text);
  const wordCount = plain.split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(wordCount / 180);
  return Math.max(1, minutes);
}

function upgradeImageQuality(url) {
  if (!url) return undefined;
  let src = url.trim().replace(/^["']|["']$/g, '');
  if (src.startsWith('//')) src = 'https:' + src;
  else if (src.startsWith('http://')) src = src.replace('http://', 'https://');

  src = src.replace(/\/s\d+([-_][a-z0-9-]+)?\//i, '/s1600/');
  src = src.replace(/\/w\d+-h\d+[^/]*\//i, '/s1600/');
  src = src.replace(/=s\d+[-_a-z0-9]*/i, '=s1600');
  src = src.replace(/=w\d+-h\d+[-_a-z0-9]*/i, '=s1600');
  return src;
}

function extractFirstImage(html) {
  if (!html) return undefined;
  const decoded = decodeHtmlEntities(html);
  const imgMatch = decoded.match(/<img[^>]+src=["']?([^"'\s>]+)["']?/i);
  if (imgMatch && imgMatch[1]) {
    const cleaned = upgradeImageQuality(imgMatch[1]);
    if (cleaned && !cleaned.includes('blank.gif') && !cleaned.includes('b16-g')) return cleaned;
  }
  const linkMatch = decoded.match(/<a[^>]+href=["']?([^"'\s>]+\.(?:jpg|jpeg|png|webp|gif))["']?/i);
  if (linkMatch && linkMatch[1]) return upgradeImageQuality(linkMatch[1]);
  return undefined;
}

function detectLanguage(title, content, categories) {
  const catString = categories.join(' ').toLowerCase();
  if (catString.includes('english') || catString.includes('en')) return 'en';
  if (catString.includes('عربي') || catString.includes('عربية')) return 'ar';
  const combined = title + ' ' + stripHtml(content).slice(0, 300);
  const latinCount = (combined.match(/[a-zA-Z]/g) || []).length;
  const arabicCount = (combined.match(/[\u0600-\u06FF]/g) || []).length;
  if (latinCount > arabicCount && latinCount > 15) return 'en';
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

async function syncToFirebase() {
  console.log('Fetching all real posts from Blogger feed...');
  let data;
  try {
    const res = await fetch('https://karimashmawy.blogspot.com/feeds/posts/default?alt=json&max-results=500');
    data = await res.json();
  } catch (e) {
    console.warn('Network fetch failed, reading from posts-cache.json...');
    data = JSON.parse(fs.readFileSync('public/posts-cache.json', 'utf8'));
  }

  const entries = data?.feed?.entry || [];
  console.log(`Processing ${entries.length} posts for Firebase Firestore upload...`);

  let successCount = 0;
  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index];
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
    if (authorAvatar && authorAvatar.includes('g/b16-g')) authorAvatar = undefined;

    const altLink = entry.link?.find((l) => l.rel === 'alternate')?.href || 'https://karimashmawy.blogspot.com';
    const categories = entry.category?.map((c) => c.term).filter(Boolean) || [];

    let rawThumb = entry.media$thumbnail?.url;
    if (rawThumb && (rawThumb.includes('blank.gif') || rawThumb.includes('b16-g'))) rawThumb = undefined;

    let thumbnail = extractFirstImage(content);
    if (!thumbnail && rawThumb) thumbnail = upgradeImageQuality(rawThumb);
    if (!thumbnail) thumbnail = HIGH_RES_FALLBACK_IMAGES[index % HIGH_RES_FALLBACK_IMAGES.length];

    const language = detectLanguage(title, content, categories);

    const postDoc = {
      id,
      title,
      content,
      snippet,
      publishedDate,
      updatedDate: updatedDate || publishedDate,
      author,
      authorAvatar: authorAvatar || '',
      link: altLink,
      categories: categories.length > 0 ? categories : [language === 'ar' ? 'مقالات' : 'Articles'],
      thumbnail,
      readingTimeMinutes: calculateReadingTime(content),
      language,
      orderIndex: index
    };

    try {
      await setDoc(doc(db, 'posts', id), postDoc);
      successCount++;
    } catch (err) {
      console.error(`Failed uploading post ${id}:`, err);
    }
  }

  console.log(`Successfully synced ${successCount} articles to Firebase Firestore Database!`);
  process.exit(0);
}

syncToFirebase();

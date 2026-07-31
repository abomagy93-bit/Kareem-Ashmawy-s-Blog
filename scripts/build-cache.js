import fs from 'fs';

async function buildCache() {
  try {
    console.log('Fetching Blogger feed for build cache...');
    const res = await fetch('https://karimashmawy.blogspot.com/feeds/posts/default?alt=json&max-results=500');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const entries = data?.feed?.entry || [];
    console.log(`Fetched ${entries.length} real posts from Blogger.`);
    
    if (!fs.existsSync('public')) {
      fs.mkdirSync('public', { recursive: true });
    }
    fs.writeFileSync('public/posts-cache.json', JSON.stringify(data, null, 2));

    if (!fs.existsSync('src/data')) {
      fs.mkdirSync('src/data', { recursive: true });
    }
    const fileContent = 'export const STATIC_POSTS_CACHE = ' + JSON.stringify(data, null, 2) + ';\n';
    fs.writeFileSync('src/data/postsCache.ts', fileContent);
    console.log('Build cache successfully updated!');
  } catch (err) {
    console.warn('Could not update cache online, using existing cache file.', err);
  }
}

buildCache();

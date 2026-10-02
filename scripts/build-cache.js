import fs from 'fs';
import path from 'path';

async function buildCache() {
  try {
    console.log('Fetching Blogger feed for build cache...');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch('https://karimashmawy.blogspot.com/feeds/posts/default?alt=json&max-results=500', {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const entries = data?.feed?.entry || [];
    console.log(`Fetched ${entries.length} real posts from Blogger.`);
    
    if (!Array.isArray(entries) || entries.length === 0) {
      console.warn('Feed returned no posts. Retaining existing cache files.');
      return;
    }

    const jsonString = JSON.stringify(data, null, 2);
    // Double-check JSON validity before writing
    JSON.parse(jsonString);

    if (!fs.existsSync('public')) {
      fs.mkdirSync('public', { recursive: true });
    }
    const publicTmp = path.join('public', `posts-cache.${Date.now()}.tmp`);
    fs.writeFileSync(publicTmp, jsonString, 'utf8');
    fs.renameSync(publicTmp, 'public/posts-cache.json');

    if (!fs.existsSync('src/data')) {
      fs.mkdirSync('src/data', { recursive: true });
    }
    const srcTmp = path.join('src/data', `postsCache.${Date.now()}.tmp`);
    fs.writeFileSync(srcTmp, jsonString, 'utf8');
    fs.renameSync(srcTmp, 'src/data/postsCache.json');

    console.log('Build cache successfully and atomically updated!');
  } catch (err) {
    console.warn('Could not update cache online (or timed out), safely keeping existing cache files.', err.message);
  }
}

buildCache();


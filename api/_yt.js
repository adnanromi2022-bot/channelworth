const API = 'https://www.googleapis.com/youtube/v3';

async function yt(path, params) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw Object.assign(new Error('Server is missing YOUTUBE_API_KEY.'), { status: 500 });
  const u = new URL(API + path);
  Object.entries({ ...params, key }).forEach(([k, v]) => u.searchParams.set(k, v));
  const r = await fetch(u);
  const j = await r.json();
  if (!r.ok) {
    const quota = (j.error && j.error.errors || []).some(e => e.reason === 'quotaExceeded');
    throw Object.assign(new Error(quota ? 'Daily YouTube quota used up. Try again tomorrow.' : 'YouTube API error.'), { status: quota ? 429 : 502 });
  }
  return j;
}

// Accepts a channel URL, @handle, UC... channel ID, or a plain name.
async function resolve(input) {
  const q = String(input || '').trim().slice(0, 200);
  if (!q) throw Object.assign(new Error('Enter a channel name, @handle or video link.'), { status: 400 });
  // Video link (watch, shorts, live, embed, youtu.be) -> find the channel that owns it (1 unit)
  const vid = q.match(/(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|live\/|embed\/)|youtu\.be\/)([\w-]{11})/i);
  if (vid) {
    const v = await yt('/videos', { part: 'snippet', id: vid[1] });
    const it = v.items && v.items[0];
    if (!it) throw Object.assign(new Error('Video not found. Check the link.'), { status: 404 });
    return { id: it.snippet.channelId };
  }
  const m = q.match(/youtube\.com\/(@[\w.\-]+|channel\/(UC[\w-]{22}))/i);
  const v = m ? (m[2] || m[1]) : q;
  if (/^UC[\w-]{22}$/.test(v)) return { id: v };
  if (v.startsWith('@')) return { forHandle: v };
  const s = await yt('/search', { part: 'snippet', type: 'channel', maxResults: 1, q: v }); // costs 100 units
  const hit = s.items && s.items[0];
  if (!hit) throw Object.assign(new Error('No channel found. Check the spelling or try the @handle.'), { status: 404 });
  return { id: hit.snippet.channelId };
}

function shape(c) {
  const s = c.statistics || {}, sn = c.snippet || {};
  const subs = s.hiddenSubscriberCount ? null : Number(s.subscriberCount || 0);
  const views = Number(s.viewCount || 0), videos = Number(s.videoCount || 0);
  return {
    id: c.id, title: sn.title, handle: sn.customUrl || '', country: sn.country || '',
    published: sn.publishedAt, thumb: sn.thumbnails && (sn.thumbnails.medium || sn.thumbnails.default || {}).url,
    subs, views, videos, avg: videos ? Math.round(views / videos) : 0
  };
}

module.exports = { yt, resolve, shape };

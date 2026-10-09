const { yt, resolve, shape } = require('./_yt');

module.exports = async (req, res) => {
  try {
    const ref = await resolve(req.query.q);
    const r = await yt('/channels', { part: 'snippet,statistics,contentDetails', ...ref });
    const c = r.items && r.items[0];
    if (!c) throw Object.assign(new Error('Channel not found.'), { status: 404 });
    const out = shape(c);

    // Latest 6 uploads with view counts
    out.latest = [];
    const uploads = c.contentDetails && c.contentDetails.relatedPlaylists && c.contentDetails.relatedPlaylists.uploads;
    if (uploads) {
      const p = await yt('/playlistItems', { part: 'contentDetails', playlistId: uploads, maxResults: 6 });
      const ids = (p.items || []).map(i => i.contentDetails.videoId).join(',');
      if (ids) {
        const v = await yt('/videos', { part: 'snippet,statistics', id: ids });
        out.latest = (v.items || []).map(x => ({
          id: x.id, title: x.snippet.title, published: x.snippet.publishedAt,
          thumb: (x.snippet.thumbnails.medium || x.snippet.thumbnails.default || {}).url,
          views: Number(x.statistics.viewCount || 0)
        }));
      }
    }
    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400'); // cache 6h
    res.status(200).json(out);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'Something went wrong.' });
  }
};

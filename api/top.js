const { yt, shape } = require('./_yt');

// Edit this list to choose the channels shown in the "Top channels" table.
const HANDLES = ['@MrBeast', '@tseries', '@PewDiePie', '@mkbhd', '@LinusTechTips', '@veritasium', '@kurzgesagt'];

module.exports = async (req, res) => {
  try {
    const rows = await Promise.all(HANDLES.map(h =>
      yt('/channels', { part: 'snippet,statistics', forHandle: h })
        .then(r => r.items && r.items[0] ? shape(r.items[0]) : null)
        .catch(() => null)
    ));
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=172800'); // cache 24h
    res.status(200).json(rows.filter(Boolean));
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'Something went wrong.' });
  }
};

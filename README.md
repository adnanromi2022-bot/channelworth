# ChannelWorth

One-page YouTube channel stats site: static `index.html` + two serverless functions in `/api`.

## Setup
1. Google Cloud Console: create a project, enable **YouTube Data API v3**, create an **API key** (restrict it to that API).
2. Put the folder in a GitHub repo and import it in **Vercel** (framework: Other).
3. Vercel > Settings > Environment Variables: add `YOUTUBE_API_KEY`. Redeploy.
4. Local test: `npm i -g vercel`, copy `.env.example` to `.env.local`, run `vercel dev`.

## Quota (free: 10,000 units/day)
- `@handle` or `UC...` lookup: about 4 units. Name search: about 104 units (the search call costs 100).
- Responses are cached (channel 6h, top list 24h) so repeat visits cost nothing.

## Notes
- Subscriber counts are rounded by YouTube. Hidden counts show as "Hidden".
- Edit `HANDLES` in `api/top.js` to change the Top channels table.
- Growth history is not available from the API. To chart it, store a daily snapshot in a database (Vercel KV/Postgres) and read it back.
- Keep the footer attribution and add a privacy policy page before launch (YouTube API Services terms).

## Before launch
- Replace `https://channelworth.com/` in `index.html`, `robots.txt` and `sitemap.xml` with your real domain.
- Edit `privacy.html` (add a contact email) and review it.
- Add the site in Google Search Console and submit `sitemap.xml`.
- RPM ranges in `index.html` (`NICHES`) are rough guesses: adjust them as you learn more.
Live

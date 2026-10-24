import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const LINKS_FILE = path.join(DATA_DIR, 'links.json');
const BIO_FILE = path.join(DATA_DIR, 'bio.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Generate realistic initial links with historical clicks
function generateSeedData() {
  const now = new Date();
  const daysAgo = (days: number, hoursOffset = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    d.setHours(d.getHours() - hoursOffset);
    return d.toISOString();
  };

  const countries = ['United States', 'United Kingdom', 'Germany', 'Canada', 'France', 'Japan', 'India', 'Brazil', 'Australia'];
  const referrers: Array<{ name: string; cat: any }> = [
    { name: 'Twitter / X', cat: 'Twitter/X' },
    { name: 'LinkedIn', cat: 'LinkedIn' },
    { name: 'WhatsApp', cat: 'WhatsApp' },
    { name: 'Facebook', cat: 'Facebook' },
    { name: 'Direct / Bookmark', cat: 'Direct' },
    { name: 'Instagram Bio', cat: 'Instagram' },
    { name: 'Reddit', cat: 'Reddit' },
    { name: 'Email Newsletter', cat: 'Email' }
  ];
  const devices: Array<'Desktop' | 'Mobile' | 'Tablet'> = ['Mobile', 'Desktop', 'Mobile', 'Desktop', 'Mobile', 'Tablet'];

  const createClicks = (count: number, baseDays: number) => {
    const clicks = [];
    for (let i = 0; i < count; i++) {
      const dayOffset = Math.floor(Math.random() * baseDays);
      const hourOffset = Math.floor(Math.random() * 24);
      const ref = referrers[Math.floor(Math.random() * referrers.length)];
      clicks.push({
        id: crypto.randomUUID(),
        timestamp: daysAgo(dayOffset, hourOffset),
        referrer: ref.name,
        referrerCategory: ref.cat,
        device: devices[Math.floor(Math.random() * devices.length)],
        browser: Math.random() > 0.4 ? 'Chrome' : Math.random() > 0.5 ? 'Safari' : 'Firefox',
        country: countries[Math.floor(Math.random() * countries.length)],
      });
    }
    return clicks.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const links = [
    {
      id: 'link-1',
      slug: 'summer-launch',
      originalUrl: 'https://github.com/features/actions?utm_source=twitter&utm_medium=social&utm_campaign=summer_launch',
      title: 'Summer 2026 Developer Platform Launch',
      description: 'Explore the newest workflow automation and high-speed CI/CD pipeline capabilities.',
      createdAt: daysAgo(14),
      clicks: 1420,
      tags: ['marketing', 'twitter', 'campaign'],
      isPasswordProtected: false,
      qrConfig: {
        dotColor: '#0f172a',
        bgColor: '#ffffff',
        logo: 'twitter',
        margin: 2
      },
      utm: {
        source: 'twitter',
        medium: 'social',
        campaign: 'summer_launch',
        term: 'automation',
        content: 'hero_cta'
      },
      clicksData: createClicks(48, 14)
    },
    {
      id: 'link-2',
      slug: 'keynote-live',
      originalUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Product Keynote & Architecture Walkthrough',
      description: 'Watch the full 45-minute live stream keynote covering next-gen cloud infra.',
      createdAt: daysAgo(7),
      clicks: 864,
      tags: ['video', 'keynote', 'youtube'],
      isPasswordProtected: false,
      qrConfig: {
        dotColor: '#dc2626',
        bgColor: '#ffffff',
        logo: 'youtube',
        margin: 2
      },
      clicksData: createClicks(36, 7)
    },
    {
      id: 'link-3',
      slug: 'founder-bio',
      originalUrl: 'https://linkedin.com/in/alex-morgan-tech',
      title: 'Alex Morgan - Executive Bio & Advisory Roles',
      description: 'Connect with Alex regarding angel investments, engineering advisory, and speaking.',
      createdAt: daysAgo(21),
      clicks: 532,
      tags: ['bio', 'linkedin', 'personal'],
      isPasswordProtected: false,
      qrConfig: {
        dotColor: '#0284c7',
        bgColor: '#ffffff',
        logo: 'link',
        margin: 2
      },
      clicksData: createClicks(25, 21)
    },
    {
      id: 'link-4',
      slug: 'confidential-deck',
      originalUrl: 'https://docs.google.com/presentation/d/sample-pitch-deck',
      title: 'Series B Confidential Investor Deck (Protected)',
      description: 'Private presentation deck for Series B institutional funding round.',
      createdAt: daysAgo(3),
      clicks: 42,
      tags: ['investor', 'protected', 'pitch'],
      isPasswordProtected: true,
      password: 'investor2026',
      qrConfig: {
        dotColor: '#475569',
        bgColor: '#ffffff',
        logo: 'none',
        margin: 2
      },
      clicksData: createClicks(12, 3)
    }
  ];

  return links;
}

function getStoredLinks(): any[] {
  try {
    if (!fs.existsSync(LINKS_FILE)) {
      const initial = generateSeedData();
      fs.writeFileSync(LINKS_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const data = fs.readFileSync(LINKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading links:', err);
    return [];
  }
}

function saveLinks(links: any[]) {
  try {
    fs.writeFileSync(LINKS_FILE, JSON.stringify(links, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving links:', err);
  }
}

function getStoredBio(): any {
  try {
    if (!fs.existsSync(BIO_FILE)) {
      const initial = {
        username: 'creator',
        displayName: 'Alex Morgan',
        bio: 'Product Engineer & Creator. Sharing tools, tech breakdowns, and founder dispatches.',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        theme: 'slate',
        socialLinks: [
          { platform: 'twitter', url: 'https://x.com' },
          { platform: 'linkedin', url: 'https://linkedin.com' },
          { platform: 'github', url: 'https://github.com' },
          { platform: 'youtube', url: 'https://youtube.com' }
        ],
        linkIds: ['link-1', 'link-2', 'link-3']
      };
      fs.writeFileSync(BIO_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const data = fs.readFileSync(BIO_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading bio:', err);
    return null;
  }
}

function saveBio(bio: any) {
  try {
    fs.writeFileSync(BIO_FILE, JSON.stringify(bio, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving bio:', err);
  }
}

// Helper to determine referrer category
function parseReferrer(rawRef: string | undefined): { name: string; cat: string } {
  if (!rawRef || rawRef === '') {
    return { name: 'Direct / In-App', cat: 'Direct' };
  }
  const refLower = rawRef.toLowerCase();
  if (refLower.includes('t.co') || refLower.includes('twitter') || refLower.includes('x.com')) {
    return { name: 'Twitter / X', cat: 'Twitter/X' };
  }
  if (refLower.includes('linkedin')) {
    return { name: 'LinkedIn', cat: 'LinkedIn' };
  }
  if (refLower.includes('whatsapp') || refLower.includes('wa.me')) {
    return { name: 'WhatsApp', cat: 'WhatsApp' };
  }
  if (refLower.includes('facebook') || refLower.includes('fb.me')) {
    return { name: 'Facebook', cat: 'Facebook' };
  }
  if (refLower.includes('instagram')) {
    return { name: 'Instagram', cat: 'Instagram' };
  }
  if (refLower.includes('reddit')) {
    return { name: 'Reddit', cat: 'Reddit' };
  }
  if (refLower.includes('youtube') || refLower.includes('youtu.be')) {
    return { name: 'YouTube', cat: 'YouTube' };
  }
  if (refLower.includes('mail') || refLower.includes('gmail') || refLower.includes('outlook')) {
    return { name: 'Email Newsletter', cat: 'Email' };
  }
  try {
    const parsed = new URL(rawRef);
    return { name: parsed.hostname, cat: 'Other' };
  } catch {
    return { name: rawRef.substring(0, 30), cat: 'Other' };
  }
}

function parseDevice(ua: string | undefined): 'Mobile' | 'Desktop' | 'Tablet' {
  if (!ua) return 'Desktop';
  const uaLower = ua.toLowerCase();
  if (uaLower.includes('ipad') || uaLower.includes('tablet')) return 'Tablet';
  if (uaLower.includes('mobile') || uaLower.includes('android') || uaLower.includes('iphone')) return 'Mobile';
  return 'Desktop';
}

function generateRandomSlug(length = 6): string {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // --- API Routes ---

  // GET /api/links - list all links
  app.get('/api/links', (req, res) => {
    const links = getStoredLinks();
    const { search, tag } = req.query;
    let filtered = [...links];

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      filtered = filtered.filter(l => 
        l.slug.toLowerCase().includes(q) || 
        l.title.toLowerCase().includes(q) || 
        l.originalUrl.toLowerCase().includes(q)
      );
    }

    if (tag && typeof tag === 'string') {
      filtered = filtered.filter(l => l.tags && l.tags.includes(tag));
    }

    res.json(filtered);
  });

  // POST /api/links - create new link
  app.post('/api/links', (req, res) => {
    const { originalUrl, customSlug, title, description, tags, isPasswordProtected, password, expiresAt, utm, qrConfig } = req.body;

    if (!originalUrl || typeof originalUrl !== 'string') {
      return res.status(400).json({ error: 'Valid URL is required' });
    }

    let urlToSave = originalUrl.trim();
    if (!urlToSave.startsWith('http://') && !urlToSave.startsWith('https://')) {
      urlToSave = 'https://' + urlToSave;
    }

    // Attach UTM parameters if provided
    if (utm && (utm.source || utm.medium || utm.campaign)) {
      try {
        const u = new URL(urlToSave);
        if (utm.source) u.searchParams.set('utm_source', utm.source);
        if (utm.medium) u.searchParams.set('utm_medium', utm.medium);
        if (utm.campaign) u.searchParams.set('utm_campaign', utm.campaign);
        if (utm.term) u.searchParams.set('utm_term', utm.term);
        if (utm.content) u.searchParams.set('utm_content', utm.content);
        urlToSave = u.toString();
      } catch (e) {
        // keep urlToSave as is
      }
    }

    const links = getStoredLinks();

    let slug = (customSlug || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-');
    if (!slug) {
      slug = generateRandomSlug(6);
    }

    // Check slug collision
    const existing = links.find(l => l.slug.toLowerCase() === slug.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: `Short alias "${slug}" is already taken. Please choose another.` });
    }

    let resolvedTitle = (title || '').trim();
    if (!resolvedTitle) {
      try {
        const u = new URL(urlToSave);
        resolvedTitle = `${u.hostname}${u.pathname.length > 1 ? u.pathname.slice(0, 24) : ''}`;
      } catch {
        resolvedTitle = `Link to ${urlToSave.slice(0, 30)}`;
      }
    }

    const newLink = {
      id: crypto.randomUUID(),
      slug,
      originalUrl: urlToSave,
      title: resolvedTitle,
      description: (description || '').trim(),
      createdAt: new Date().toISOString(),
      clicks: 0,
      tags: Array.isArray(tags) ? tags : [],
      isPasswordProtected: Boolean(isPasswordProtected && password),
      password: isPasswordProtected ? password : '',
      expiresAt: expiresAt || null,
      qrConfig: qrConfig || {
        dotColor: '#0f172a',
        bgColor: '#ffffff',
        logo: 'link',
        margin: 2
      },
      utm: utm || {},
      clicksData: []
    };

    links.unshift(newLink);
    saveLinks(links);

    res.status(201).json(newLink);
  });

  // GET /api/links/:id - get single link
  app.get('/api/links/:id', (req, res) => {
    const links = getStoredLinks();
    const link = links.find(l => l.id === req.params.id || l.slug === req.params.id);
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }
    res.json(link);
  });

  // PATCH /api/links/:id - update link
  app.patch('/api/links/:id', (req, res) => {
    const links = getStoredLinks();
    const index = links.findIndex(l => l.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Link not found' });
    }

    const current = links[index];
    const { title, description, tags, slug, isPasswordProtected, password, expiresAt, qrConfig } = req.body;

    if (slug && slug.toLowerCase() !== current.slug.toLowerCase()) {
      const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      const conflict = links.find(l => l.id !== current.id && l.slug.toLowerCase() === cleanSlug);
      if (conflict) {
        return res.status(409).json({ error: `Slug "${cleanSlug}" is already taken.` });
      }
      current.slug = cleanSlug;
    }

    if (title !== undefined) current.title = title;
    if (description !== undefined) current.description = description;
    if (tags !== undefined) current.tags = tags;
    if (isPasswordProtected !== undefined) {
      current.isPasswordProtected = isPasswordProtected;
      if (isPasswordProtected && password) current.password = password;
      if (!isPasswordProtected) current.password = '';
    }
    if (expiresAt !== undefined) current.expiresAt = expiresAt;
    if (qrConfig !== undefined) current.qrConfig = { ...current.qrConfig, ...qrConfig };

    links[index] = current;
    saveLinks(links);

    res.json(current);
  });

  // DELETE /api/links/:id
  app.delete('/api/links/:id', (req, res) => {
    let links = getStoredLinks();
    const beforeCount = links.length;
    links = links.filter(l => l.id !== req.params.id);
    if (links.length === beforeCount) {
      return res.status(404).json({ error: 'Link not found' });
    }
    saveLinks(links);
    res.json({ success: true, message: 'Link deleted' });
  });

  // POST /api/links/:id/simulate-click - test analytics live
  app.post('/api/links/:id/simulate-click', (req, res) => {
    const { referrer, device, country } = req.body;
    const links = getStoredLinks();
    const link = links.find(l => l.id === req.params.id);
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    const ref = parseReferrer(referrer || 'Twitter / X');
    const newClick = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      referrer: ref.name,
      referrerCategory: ref.cat,
      device: device || 'Mobile',
      browser: 'Mobile Safari',
      country: country || 'United States',
    };

    link.clicks = (link.clicks || 0) + 1;
    link.clicksData = [newClick, ...(link.clicksData || [])];
    saveLinks(links);

    res.json({ success: true, link, click: newClick });
  });

  // POST /api/preview-meta - inspect long URL preview
  app.post('/api/preview-meta', (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL required' });

    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      const hostname = parsed.hostname;
      
      // Generate clean metadata matching the target site
      let siteName = hostname.replace('www.', '').split('.')[0];
      siteName = siteName.charAt(0).toUpperCase() + siteName.slice(1);
      
      const sampleTitles: Record<string, string> = {
        'github.com': 'GitHub: Let’s build from here',
        'youtube.com': 'YouTube - Watch & Share Videos',
        'x.com': 'X. It’s what’s happening',
        'twitter.com': 'X / Twitter - Breaking News and Entertainment',
        'linkedin.com': 'LinkedIn: Log In or Sign Up',
        'instagram.com': 'Instagram - Photos, Videos and Stories',
        'spotify.com': 'Spotify - Web Player: Music for everyone'
      };

      const title = sampleTitles[hostname] || `${siteName} - Official Content & Resources`;
      const description = `Discover updates, releases, and key announcements hosted at ${hostname}.`;
      
      res.json({
        domain: hostname,
        siteName,
        title,
        description,
        favicon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
      });
    } catch {
      res.status(400).json({ error: 'Invalid URL provided' });
    }
  });

  // GET /api/bio - Bio Profile
  app.get('/api/bio', (req, res) => {
    const bio = getStoredBio();
    res.json(bio);
  });

  // POST /api/bio - Update Bio Profile
  app.post('/api/bio', (req, res) => {
    const updated = { ...getStoredBio(), ...req.body };
    saveBio(updated);
    res.json(updated);
  });

  // GET /r/:slug - Actual link redirector with real analytics tracking!
  app.get('/r/:slug', (req, res) => {
    const slug = req.params.slug;
    const links = getStoredLinks();
    const link = links.find(l => l.slug.toLowerCase() === slug.toLowerCase());

    if (!link) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Link Not Found - SnipLink</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-slate-900 text-slate-100 flex items-center justify-center min-h-screen p-4 font-sans">
          <div class="max-w-md w-full bg-slate-800/80 border border-slate-700 p-8 rounded-2xl text-center shadow-xl">
            <div class="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">404</div>
            <h1 class="text-xl font-bold text-white mb-2">Short Link Not Found</h1>
            <p class="text-slate-400 text-sm mb-6">The link <code>/r/${slug}</code> does not exist or has been removed by its creator.</p>
            <a href="/" class="inline-flex items-center justify-center px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-lg transition-colors text-sm">
              Go to SnipLink Home
            </a>
          </div>
        </body>
        </html>
      `);
    }

    // Check expiration
    if (link.expiresAt && new Date(link.expiresAt).getTime() < Date.now()) {
      return res.status(410).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Link Expired - SnipLink</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-slate-900 text-slate-100 flex items-center justify-center min-h-screen p-4 font-sans">
          <div class="max-w-md w-full bg-slate-800/80 border border-slate-700 p-8 rounded-2xl text-center shadow-xl">
            <div class="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">⏳</div>
            <h1 class="text-xl font-bold text-white mb-2">This Link Has Expired</h1>
            <p class="text-slate-400 text-sm mb-6">This shortened link expired on ${new Date(link.expiresAt).toLocaleDateString()}.</p>
            <a href="/" class="inline-flex items-center justify-center px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-lg transition-colors text-sm">
              Create New Short Link
            </a>
          </div>
        </body>
        </html>
      `);
    }

    // Check Password Protection
    if (link.isPasswordProtected && link.password) {
      const enteredPassword = req.query.pwd;
      if (!enteredPassword || enteredPassword !== link.password) {
        return res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Protected Link - SnipLink</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body class="bg-slate-900 text-slate-100 flex items-center justify-center min-h-screen p-4 font-sans">
            <div class="max-w-md w-full bg-slate-800/90 border border-slate-700 p-8 rounded-2xl shadow-xl">
              <div class="w-12 h-12 bg-orange-500/10 text-orange-400 rounded-xl flex items-center justify-center mb-4 text-xl">🔒</div>
              <h1 class="text-xl font-bold text-white mb-1">Password Protected Link</h1>
              <p class="text-slate-400 text-xs mb-6">Please enter the security password configured by the link owner to proceed.</p>
              
              ${enteredPassword ? '<div class="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">Incorrect password. Please try again.</div>' : ''}

              <form method="GET" action="/r/${slug}">
                <div class="mb-4">
                  <label class="block text-xs font-medium text-slate-300 mb-1.5">Enter Password</label>
                  <input type="password" name="pwd" required autofocus class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500" placeholder="••••••••">
                </div>
                <button type="submit" class="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-lg text-sm transition-colors">
                  Unlock & Continue &rarr;
                </button>
              </form>
            </div>
          </body>
          </html>
        `);
      }
    }

    // Record Click Analytics
    const rawRef = req.headers.referer || req.headers.referrer;
    const ref = parseReferrer(typeof rawRef === 'string' ? rawRef : undefined);
    const ua = req.headers['user-agent'];
    const device = parseDevice(ua);

    const clickRecord = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      referrer: ref.name,
      referrerCategory: ref.cat,
      device: device,
      browser: ua && ua.includes('Firefox') ? 'Firefox' : ua && ua.includes('Safari') && !ua.includes('Chrome') ? 'Safari' : 'Chrome',
      country: req.headers['cf-ipcountry'] ? String(req.headers['cf-ipcountry']) : 'United States',
    };

    link.clicks = (link.clicks || 0) + 1;
    link.clicksData = [clickRecord, ...(link.clicksData || [])];
    saveLinks(links);

    // If client requested no direct redirect (e.g. preview mode), render instant forwarding card
    if (req.query.preview === '1') {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Redirecting to ${link.title} - SnipLink</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <meta http-equiv="refresh" content="2;url=${link.originalUrl}">
        </head>
        <body class="bg-slate-900 text-slate-100 flex items-center justify-center min-h-screen p-4 font-sans">
          <div class="max-w-md w-full bg-slate-800/80 border border-slate-700 p-8 rounded-2xl text-center shadow-xl">
            <div class="w-12 h-12 bg-orange-500/10 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin text-xl">⚡</div>
            <h1 class="text-lg font-bold text-white mb-2">Redirecting you...</h1>
            <p class="text-slate-400 text-xs mb-4 truncate">${link.originalUrl}</p>
            <p class="text-xs text-slate-500 mb-6">You will be forwarded automatically in 2 seconds.</p>
            <a href="${link.originalUrl}" class="inline-flex items-center justify-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium">
              Click here if not redirected
            </a>
          </div>
        </body>
        </html>
      `);
    }

    // Direct 302 Redirect
    return res.redirect(302, link.originalUrl);
  });

  // --- Vite / Static Handling ---
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`SnipLink Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

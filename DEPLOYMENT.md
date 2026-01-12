# Deployment Guide

## Quick Deploy to Vercel

The easiest way to deploy this application is using Vercel:

### Option 1: Deploy Button

Click the button below to deploy with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR-USERNAME/YOUR-REPO)

### Option 2: Manual Deployment

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Lilypad Pond"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "Add New Project"
   - Import your repository
   - Click "Deploy"

3. **Configure (Optional)**
   - No configuration needed for basic deployment
   - The project will work out of the box with in-memory storage

### Option 3: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Adding Persistent Storage (Optional)

The application currently uses in-memory storage, which works fine but pond links will expire when the server restarts. For production, you can add persistent storage:

### Vercel KV (Redis)

1. Go to your Vercel project dashboard
2. Click "Storage" tab
3. Create a new KV database
4. Update `app/api/pond/route.ts`:

```typescript
import { kv } from '@vercel/kv';

// Replace pondStorage with:
export async function POST(request: NextRequest) {
  // ... validation code ...

  const id = generatePondId();
  await kv.set(`pond:${id}`, JSON.stringify(config));

  return NextResponse.json({ id, url: `/pond/${id}` });
}

export async function GET(request: NextRequest) {
  const id = searchParams.get('id');
  const configStr = await kv.get(`pond:${id}`);

  if (!configStr) {
    return NextResponse.json({ error: 'Pond not found' }, { status: 404 });
  }

  return NextResponse.json(JSON.parse(configStr as string));
}
```

### Vercel Postgres

1. Go to your Vercel project dashboard
2. Click "Storage" tab
3. Create a new Postgres database
4. Run migrations:

```sql
CREATE TABLE ponds (
  id TEXT PRIMARY KEY,
  config JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

5. Update `app/api/pond/route.ts`:

```typescript
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  // ... validation code ...

  const id = generatePondId();
  await sql`
    INSERT INTO ponds (id, config)
    VALUES (${id}, ${JSON.stringify(config)})
  `;

  return NextResponse.json({ id, url: `/pond/${id}` });
}

export async function GET(request: NextRequest) {
  const id = searchParams.get('id');
  const { rows } = await sql`
    SELECT config FROM ponds WHERE id = ${id}
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Pond not found' }, { status: 404 });
  }

  return NextResponse.json(rows[0].config);
}
```

## Other Deployment Platforms

### Netlify

1. Update `next.config.js`:
```javascript
module.exports = {
  output: 'standalone',
}
```

2. Deploy via Netlify CLI or connect GitHub repo

### Railway

1. Create a new project on Railway
2. Connect GitHub repo
3. Railway will automatically detect Next.js and deploy

### Docker

```dockerfile
FROM node:18-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

## Environment Variables

No environment variables are required for basic functionality.

Optional environment variables:

```env
# For production analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# For custom domain
NEXT_PUBLIC_SITE_URL=https://yourpond.com

# For Vercel KV (auto-populated when you add KV)
KV_URL=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...

# For Vercel Postgres (auto-populated when you add Postgres)
POSTGRES_URL=...
```

## Post-Deployment Checklist

- [ ] Test the landing page loads correctly
- [ ] Create a test pond and verify it generates a share link
- [ ] Open the share link and verify the pond renders correctly
- [ ] Test on mobile devices
- [ ] Test tap/click interactions (ripples, lily pad wobbles)
- [ ] Verify "Copy link" button works
- [ ] Check that the dedication text displays correctly

## Monitoring and Maintenance

### Vercel Analytics

Enable analytics in your Vercel dashboard to track:
- Page views
- Performance metrics
- User geography

### Error Tracking

Consider adding error tracking:

```bash
npm install @sentry/nextjs
```

Follow [Sentry's Next.js guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/) for setup.

## Custom Domain

1. Go to Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. SSL certificate will be automatically provisioned

## Troubleshooting

### Build Fails

- Ensure Node.js version is 18+
- Clear `.next` folder and rebuild: `rm -rf .next && npm run build`
- Check for TypeScript errors: `npx tsc --noEmit`

### Canvas Not Rendering

- Check browser console for errors
- Verify Canvas API is supported (all modern browsers)
- Check devicePixelRatio handling on high-DPI displays

### Ponds Not Persisting

- In-memory storage is ephemeral - add persistent storage (see above)
- Or use the URL-encoded fallback feature

## Performance Optimization

The app is already optimized for performance:
- Static page generation where possible
- Efficient canvas rendering with requestAnimationFrame
- Minimal dependencies
- CSS modules for optimal loading

For further optimization:
- Enable Vercel Edge Functions for API routes
- Use Image optimization for any added assets
- Implement service worker for offline support

## Support

For issues or questions:
- Check the main README.md
- Open an issue on GitHub
- Contact [@bubbleteacrypto](https://twitter.com/bubbleteacrypto)

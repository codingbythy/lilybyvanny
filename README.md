# Lilypad Pond 🪷

A shareable interactive web experience where you can design your own personalized pond scene with lily pads, koi fish, and frogs, then share it with a unique URL.

![Lilypad Pond](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue) ![Canvas](https://img.shields.io/badge/HTML5-Canvas-orange)

## Features

- **Interactive Canvas Rendering**: Everything is procedurally drawn using HTML5 Canvas
- **Customizable Elements**:
  - 1-30 lily pads with gentle bobbing animation
  - 4 times of day (Dawn, Day, Dusk, Night) with unique color schemes
  - Swimming koi fish (1-3) with smooth animations
  - Frogs (0-5) sitting on lily pads with blinking eyes
  - Personal dedication text (up to 80 characters)
- **Deterministic Randomness**: Same seed always produces the same pond layout
- **Interactive**:
  - Tap/click anywhere to create ripples
  - Tap lily pads to make them wobble
- **Shareable**: Generate unique URLs to share your pond creation
- **Mobile-First**: Fully responsive design, works great on all devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Rendering**: HTML5 Canvas with requestAnimationFrame
- **Styling**: CSS Modules
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/codingbythy/lilybyvanny.git
cd lilybyvanny
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
lilybyvanny/
├── app/
│   ├── api/
│   │   └── pond/
│   │       └── route.ts          # API endpoint for saving/loading ponds
│   ├── pond/
│   │   ├── [id]/
│   │   │   ├── page.tsx          # Dynamic pond share page
│   │   │   └── page.module.css
│   │   └── encoded/
│   │       └── page.tsx          # Fallback for URL-encoded ponds
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page with editor
│   └── page.module.css
├── components/
│   └── PondCanvas.tsx            # React wrapper for canvas renderer
├── lib/
│   ├── canvas/
│   │   ├── PondRenderer.ts       # Main renderer orchestrator
│   │   ├── WaterLayer.ts         # Water and ripple rendering
│   │   ├── PadsLayer.ts          # Lily pad rendering
│   │   ├── KoiLayer.ts           # Koi fish rendering
│   │   ├── FrogLayer.ts          # Frog rendering
│   │   └── TextLayer.ts          # Dedication text rendering
│   ├── types.ts                  # TypeScript type definitions
│   ├── random.ts                 # Deterministic RNG
│   ├── colors.ts                 # Color schemes for time of day
│   └── encoding.ts               # URL encoding/decoding utilities
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

## How It Works

### Canvas Rendering

The pond scene is rendered using a layered approach:

1. **WaterLayer**: Draws gradient background and manages animated ripples
2. **KoiLayer**: Renders swimming koi fish (drawn underneath lily pads)
3. **PadsLayer**: Draws lily pads with bobbing animation and notch details
4. **FrogLayer**: Renders frogs on lily pads with blinking animation
5. **TextLayer**: Displays dedication text elegantly

All rendering is done procedurally - no image assets required!

### Deterministic Randomness

The `SeededRandom` class uses the mulberry32 algorithm to ensure that:
- Same seed = same pond layout across all devices
- Lily pad positions, sizes, and properties are consistent
- Koi and frog placements are reproducible

### Data Persistence

Currently uses in-memory storage (Map) for development. For production, you can integrate:

**Option 1: Vercel KV (Redis)**
```typescript
import { kv } from '@vercel/kv';

// In route.ts
await kv.set(`pond:${id}`, config);
const config = await kv.get(`pond:${id}`);
```

**Option 2: Vercel Postgres**
```typescript
import { sql } from '@vercel/postgres';

// Create table
await sql`CREATE TABLE ponds (id TEXT PRIMARY KEY, config JSONB)`;

// Save
await sql`INSERT INTO ponds (id, config) VALUES (${id}, ${JSON.stringify(config)})`;

// Load
const { rows } = await sql`SELECT config FROM ponds WHERE id = ${id}`;
```

**Option 3: URL Encoding (Fallback)**
The app already supports encoding pond configurations into the URL as a base64 query parameter. This works without any database but produces longer URLs.

## Deployment to Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

### Manual Deploy

1. Push your code to GitHub/GitLab/Bitbucket

2. Go to [vercel.com](https://vercel.com) and sign in

3. Click "Add New Project"

4. Import your repository

5. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: (leave default)

6. (Optional) Add environment variables if using Vercel KV or Postgres:
   - No additional setup needed for in-memory storage
   - For Vercel KV: Add the KV database through the Vercel dashboard
   - For Vercel Postgres: Add the Postgres database through the Vercel dashboard

7. Click "Deploy"

Your pond app will be live in ~2 minutes!

## Environment Variables

No environment variables required for basic functionality. The app works out of the box with in-memory storage.

For production with persistent storage:

```env
# For Vercel KV
KV_URL=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...

# For Vercel Postgres
POSTGRES_URL=...
POSTGRES_PRISMA_URL=...
POSTGRES_URL_NON_POOLING=...
```

These are automatically populated when you add a database through the Vercel dashboard.

## Customization

### Adding New Time of Day Options

Edit `lib/colors.ts` and add a new color scheme:

```typescript
case 'sunset':
  return {
    skyTop: '#FF6B9D',
    skyBottom: '#FFC371',
    waterTop: 'rgba(150, 100, 180, 0.7)',
    waterBottom: 'rgba(80, 50, 120, 0.9)',
    padColor: '#2B4B2B',
    padShadow: 'rgba(0, 0, 0, 0.4)',
    textColor: '#4A4A4A',
  };
```

### Adjusting Animation Parameters

Each layer class has configurable parameters:
- **Water ripples**: Adjust `speed` and `maxRadius` in `WaterLayer.ts`
- **Lily pad bobbing**: Modify `bobSpeed` in `PadsLayer.ts`
- **Koi swimming**: Change `speed` and `turnSpeed` in `KoiLayer.ts`
- **Frog blinking**: Adjust `nextBlinkTime` range in `FrogLayer.ts`

## Performance

- Uses `requestAnimationFrame` for smooth 60fps animation
- Canvas scaled for retina displays (devicePixelRatio)
- Efficient rendering with minimal overdraw
- No external dependencies for rendering

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support with touch events

## Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## License

MIT License - feel free to use this project for learning or building your own creative experiences!

## Credits

Created with care by [@bubbleteacrypto](https://twitter.com/bubbleteacrypto)

Built with Next.js, TypeScript, and HTML5 Canvas.

---

Enjoy creating and sharing your ponds! 🪷🐸🐠

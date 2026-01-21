# How to Add Images and Deploy to Vercel

## Adding Images Locally

1. **Save the lilypad image:**
   - Save the lilypad.png image to: `/public/images/lilypads/lilypad.png`

2. **Add koi images (6 total):**
   - Save koi fish images to: `/public/images/kois/koi-1.png` through `koi-6.png`
   - Each should be a different colored koi on transparent background

3. **Add frog images (6 total):**
   - Save frog images to: `/public/images/frogs/frog-1.png` through `frog-6.png`
   - Each should be a different frog pose on transparent background

## Directory Structure

```
/public
  /images
    /lilypads
      lilypad.png
    /kois
      koi-1.png to koi-6.png
    /frogs
      frog-1.png to frog-6.png
```

## Deploying to Vercel

### Automatic Deployment
The `/public` folder contents are **automatically included** in Vercel deployments!

### Steps:
1. Add images to `/public/images/` locally
2. Commit changes: `git add public/images/ && git commit -m "Add image assets"`
3. Push to GitHub: `git push`
4. Vercel auto-deploys (if connected to GitHub)

### Manual Deploy:
```bash
npm i -g vercel
vercel --prod
```

Images will be accessible at:
- `https://your-app.vercel.app/images/lilypads/lilypad.png`
- `https://your-app.vercel.app/images/kois/koi-1.png`
- etc.

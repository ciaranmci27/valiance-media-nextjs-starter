# Favicon Assets

This folder contains all favicon assets for the marketing website. Follow the steps below to generate and add new favicon assets.

## Quick Setup with favicon.io

### Step 1: Generate Favicon Assets
1. Go to [favicon.io/favicon-converter/](https://favicon.io/favicon-converter/)
2. Upload your logo image (recommended: 512x512px or larger, PNG format)
3. The converter will automatically generate all necessary favicon formats

### Step 2: Download and Extract
1. Click "Download" to get the favicon package
2. Extract the ZIP file to a temporary location
3. You'll find a `favicon` folder with all the generated assets

### Step 3: Upload to This Folder
1. Copy all files from the extracted `favicon` folder
2. Paste them directly into this `marketing-site/public/favicon/` folder
3. Replace any existing files if prompted

## Generated Assets Include:
- `android-chrome-192x192.png` - Android Chrome icon
- `android-chrome-512x512.png` - Android Chrome icon (large)
- `apple-touch-icon.png` - iOS Safari icon
- `favicon-16x16.png` - Standard favicon (16px)
- `favicon-32x32.png` - Standard favicon (32px)
- `favicon.ico` - Traditional favicon format
- `site.webmanifest` - Web app manifest file

## Next.js Integration
The favicon assets are automatically served from the `public/favicon/` folder. Make sure your `layout.tsx` includes the proper meta tags:

```tsx
// In your layout.tsx or head component
<link rel="icon" type="image/x-icon" href="/favicon/favicon.ico" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
<link rel="manifest" href="/favicon/site.webmanifest" />
```

## Tips
- Use a high-resolution logo (512x512px minimum) for best results
- Ensure your logo has good contrast and works well at small sizes
- Test the favicon across different browsers and devices
- The `site.webmanifest` file can be customized for PWA features

## Alternative Tools
If favicon.io is unavailable, you can also use:
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Favicon Generator](https://www.favicon-generator.org/)
- [Favicon.cc](https://www.favicon.cc/)

All these tools follow a similar process: upload image → generate assets → download and extract → upload to this folder.

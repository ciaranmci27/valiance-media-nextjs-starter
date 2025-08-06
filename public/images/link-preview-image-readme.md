# Open Graph Image Placeholder

## Required: Add Your OG Image

Please add your Open Graph image here with the filename `og-image.jpg`

### Specifications:
- **Dimensions**: 1200x630 pixels (exactly)
- **Format**: JPG or PNG
- **File Size**: Under 1MB recommended
- **Content**: Should include your logo and brand message

### Design Tips:
1. **Keep text large and readable** - Remember this will appear small in social feeds
2. **Use high contrast** - Ensure text stands out against the background
3. **Include your logo** - Build brand recognition
4. **Add a compelling headline** - Capture attention quickly
5. **Use brand colors** - Maintain visual consistency

### Tools to Create OG Images:
- **Canva**: Has OG image templates (search for "Facebook Link Preview")
- **Figma**: Create custom designs at 1200x630px
- **Adobe Express**: Free templates available
- **Bannerbear**: API for dynamic OG images
- **Vercel OG Image Generator**: For dynamic generation

### Testing Your OG Image:
1. **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
2. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
3. **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/

### File Naming:
The SEO configuration expects the file to be named `og-image.jpg` in this directory.

If you use a different format (PNG), update the path in:
- `src/config/seo.config.ts` → `openGraph.defaultImage`

### Dynamic OG Images (Advanced):
For dynamic OG images per page, see the SEO_GUIDE.md for implementation details using Next.js OG Image Generation.
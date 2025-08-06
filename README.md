# Valiance Media Next.js Starter Boilerplate

<img width="1915" height="904" alt="image" src="https://github.com/user-attachments/assets/4f25c737-f2dc-4d83-9f8c-0d58d942608e" />

A production-ready Next.js boilerplate with built-in SEO optimization, theme support, and modern development practices. Created by [Valiance Media LLC](https://valiancemedia.com) to accelerate the development of marketing websites and web applications.

## 🚀 Features

### SEO Optimized
- **Complete SEO Setup**: Meta tags, Open Graph, Twitter Cards, and structured data
- **Automatic Sitemap**: Dynamic sitemap generation at `/sitemap.xml`
- **Robots.txt**: Configurable crawling rules
- **Schema.org Integration**: Organization, WebSite, Product, FAQ, and more
- **Performance Focused**: Optimized for Core Web Vitals

### Developer Experience
- **TypeScript**: Full type safety across the application
- **Tailwind CSS**: Utility-first CSS framework with blue-based theme
- **Theme System**: Built-in dark/light mode support with Valiance Media branding
- **Component Library**: Reusable UI components with consistent naming
- **ESLint & Prettier**: Code quality and formatting
- **File Organization**: Clean, logical structure with centralized exports
- **Design System**: Comprehensive typography and spacing system with CSS variables

### Production Ready
- **Favicon Setup**: Complete favicon package with easy generation
- **Legal Pages**: Privacy Policy and Terms of Service templates
- **Analytics Ready**: Pre-configured for Google Analytics, Facebook Pixel, and more
- **Mobile Optimized**: Responsive design with mobile-first approach
- **Layout Architecture**: Optimized layout system with global components
- **Comprehensive .gitignore**: Properly configured to exclude build artifacts and cache files

## 📦 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn or pnpm

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/valiance-media/nextjs-starter.git my-project
cd my-project
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
# Create .env.local file
echo "NEXT_PUBLIC_SITE_URL=http://localhost:3000" > .env.local
```

4. **Update the SEO configuration:**
- Edit `src/seo/seo.config.ts` with your company information
- Update site URL, social media links, and verification codes

5. **Generate favicon assets:**
- Go to [favicon.io/favicon-converter/](https://favicon.io/favicon-converter/)
- Upload your logo (512x512px or larger recommended)
- Download and extract files to `public/favicon/`

6. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your site.

## 🎨 Customization

### SEO Configuration
All SEO settings are centralized in `src/seo/seo.config.ts`. Update this file with:
- Your company name and details
- Default meta descriptions and keywords
- Social media handles
- Analytics IDs
- Verification codes

See the [SEO Guide](src/seo/README.md) for detailed instructions.

### Favicon Generation
1. Go to [favicon.io/favicon-converter/](https://favicon.io/favicon-converter/)
2. Upload your logo (512x512px or larger recommended)
3. Download the generated package
4. Extract and upload all files to `public/favicon/`

### Theme Customization
- Edit `src/styles/themes.ts` for color schemes
- Modify `tailwind.config.js` for design tokens
- Update `src/styles/` for typography and spacing
- Use CSS variables for consistent theming across components

### Typography System
The boilerplate includes a comprehensive typography system:
- **CSS Variables**: All typography values are defined as CSS variables in `src/styles/globals.css`
- **Base Styles**: HTML elements (`h1`, `h2`, `p`, etc.) automatically inherit design system typography
- **Utility Classes**: Custom typography classes (`.text-h1`, `.text-body1`, etc.) for specific styling
- **Responsive Design**: Typography scales appropriately across different screen sizes

### Adding Pages
Create new pages in `src/app/` following Next.js App Router conventions:

```typescript
// src/app/about/page.tsx
import { Metadata } from 'next';
import { generateMetadata } from '@/seo/seo-utils';
import { PageWrapper } from '@/components/PageWrapper';

export const metadata: Metadata = generateMetadata({
  title: 'About Us',
  description: 'Learn about our company',
});

export default function AboutPage() {
  return (
    <PageWrapper>
      {/* Your page content */}
    </PageWrapper>
  );
}
```

## 📁 Project Structure

```
├── public/
│   ├── favicon/          # Favicon assets
│   ├── images/           # Static images
│   └── logos/            # Company logos
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── layout.tsx    # Root layout with global Header/Footer
│   │   ├── page.tsx      # Homepage (example template)
│   │   ├── privacy/      # Privacy policy page
│   │   │   └── page.tsx
│   │   ├── terms-of-service/ # Terms page
│   │   │   └── page.tsx
│   │   ├── sitemap.ts    # Auto-generated sitemap (re-export)
│   │   └── robots.ts     # Robots.txt configuration (re-export)
│   ├── components/       # Reusable components
│   │   ├── ui/          # UI components
│   │   ├── Header.tsx   # Site header
│   │   ├── Footer.tsx   # Site footer
│   │   └── PageWrapper.tsx # Page content wrapper
│   ├── seo/             # SEO utilities and configuration
│   │   ├── index.ts     # Centralized SEO exports
│   │   ├── README.md    # SEO documentation
│   │   ├── seo.config.ts # SEO settings
│   │   ├── seo-utils.ts # SEO utility functions
│   │   ├── SEO.tsx      # SEO component
│   │   ├── StructuredData.tsx # JSON-LD component
│   │   ├── sitemap.ts   # Sitemap generation
│   │   └── robots.ts    # Robots.txt generation
│   ├── styles/          # Global styles and design system
│   │   ├── index.ts     # Centralized style exports
│   │   ├── README.md    # Style documentation
│   │   ├── globals.css  # Global CSS with CSS variables
│   │   ├── themes.ts    # Theme definitions
│   │   ├── typography.ts # Typography utilities
│   │   ├── spacing.ts   # Spacing utilities
│   │   └── shadows.ts   # Shadow utilities
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   └── theme/           # Theme provider
│       └── ThemeProvider.tsx
├── .gitignore           # Comprehensive ignore rules
├── next.config.ts       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

## 🔧 Configuration Files

- `next.config.ts` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration with blue theme
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and scripts
- `.gitignore` - Comprehensive ignore rules for build artifacts, cache files, and development tools

## 📝 Documentation

- [SEO Guide](src/seo/GUIDE_FOR_SEO.md) - Complete SEO setup and best practices
- [Style Guide](src/styles/STYLE_GUIDE.md) - Design system and component guidelines
- [Favicon Guide](public/favicon/create-favicon-readme.md) - Favicon generation instructions

## 🚢 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Set environment variables:
   - `NEXT_PUBLIC_SITE_URL` - Your production URL
4. Deploy

### Environment Variables
```env
# Required
NEXT_PUBLIC_SITE_URL=https://yoursite.com

# Optional - Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FB_PIXEL_ID=XXXXXXXXXX

# Optional - Verification
GOOGLE_SITE_VERIFICATION=XXXXXXXXXX
BING_SITE_VERIFICATION=XXXXXXXXXX
```

### Other Platforms
This boilerplate works with any platform that supports Next.js:
- Netlify
- AWS Amplify
- Google Cloud Run
- Docker containers

## 🛠️ Built With

- [Next.js 15](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS with custom theme
- [React 19](https://react.dev/) - UI library

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Based on the official Next.js examples by Vercel.
Modified and maintained by Valiance Media LLC.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 💼 About Valiance Media

[Valiance Media LLC](https://valiancemedia.com) creates innovative in-house software solutions and e-commerce brands. We build digital products that drive growth and deliver exceptional user experiences.

### Our Portfolio
- E-commerce Solutions
- Digital Product Innovation
- SaaS Development

### Contact
- Website: [valiancemedia.com](https://valiancemedia.com)
- Email: contact@valiancemedia.com

## ⚡ Performance

This boilerplate is optimized for:
- **Lighthouse Score**: 95+ across all metrics
- **Core Web Vitals**: Optimized for LCP, FID, and CLS
- **SEO Score**: 100/100 on most SEO analyzers
- **Accessibility**: WCAG 2.1 AA compliant

## 🔄 Updates

This boilerplate is actively maintained and updated with:
- Latest Next.js features and best practices
- Security updates and dependency upgrades
- New SEO strategies and optimizations
- Community feedback and contributions
- Improved design system with CSS variables
- Enhanced typography and spacing system

## 🎨 Design System

### Color Palette
- **Primary**: Blue-based theme matching Valiance Media branding
- **Secondary**: Complementary blue shades
- **Accent**: Cyan highlights
- **Dark/Light**: Full theme support with CSS variables

### Typography System
- **CSS Variables**: All typography values centralized in CSS variables
- **Base Elements**: HTML elements automatically inherit design system typography
- **Utility Classes**: Custom classes for specific styling needs
- **Responsive**: Scales appropriately across all screen sizes

### Component Naming
- `Header.tsx` - Site navigation (industry standard)
- `Footer.tsx` - Site footer (industry standard)
- `PageWrapper.tsx` - Consistent page content wrapper

### File Organization
- **Centralized Exports**: Index files for clean imports
- **Logical Grouping**: Related files in dedicated directories
- **Documentation**: README files for each major directory

---

**Made with ❤️ by Valiance Media LLC**

*Building digital excellence, one project at a time.*

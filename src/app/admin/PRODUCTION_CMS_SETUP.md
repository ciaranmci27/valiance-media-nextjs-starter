# Production CMS Setup Guide

## Overview
This guide explains how to set up the admin CMS to work in production environments like Vercel or Netlify, where the file system is read-only.

## How It Works

### Local Development (Default)
```
Create/Edit Post → Save to /public/blog-content/ → Git Commit → Push → Deploy
```

### Production with GitHub API
```
Create/Edit Post → GitHub API → Commit to Repo → Auto Deploy → Live
```

## Setup Instructions

### 1. Create a GitHub Personal Access Token

1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name like "CMS Access"
4. Select the `repo` scope (Full control of private repositories)
5. Generate and copy the token

### 2. Configure Environment Variables

Add these to your Vercel/Netlify environment variables:

```env
# GitHub API Configuration
GITHUB_TOKEN=ghp_your_personal_access_token
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-repo-name
GITHUB_BRANCH=main  # or your default branch

# Admin Authentication (keep these secure!)
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-secure-password
ADMIN_TOKEN=your-secret-token
```

### 3. Set Up Deploy Webhook (Optional but Recommended)

#### For Vercel:
1. Go to your project settings on Vercel
2. Navigate to "Git" → "Deploy Hooks"
3. Create a hook with name "CMS Updates"
4. Copy the webhook URL
5. Add to environment variables:
```env
DEPLOY_WEBHOOK_URL=https://api.vercel.com/v1/integrations/deploy/...
```

#### For Netlify:
1. Go to Site Settings → Build & Deploy → Build hooks
2. Add a build hook named "CMS Updates"
3. Copy the webhook URL
4. Add to environment variables

### 4. Update Your Blog Post Components

In your blog post creation/editing components, detect if GitHub API is available:

```typescript
// Check if we should use GitHub API or local file system
const useGitHub = process.env.NODE_ENV === 'production' && 
                  process.env.GITHUB_TOKEN;

const apiEndpoint = useGitHub 
  ? '/api/admin/blog-post/github'  // Production
  : '/api/admin/blog-post';         // Local development
```

### 5. How to Use in Production

1. **Access Admin Panel**: Go to `https://yoursite.com/admin`
2. **Login**: Use your admin credentials
3. **Create/Edit Posts**: Work exactly as in development
4. **Publishing**: 
   - Posts are committed to GitHub automatically
   - Vercel/Netlify detects the commit and rebuilds
   - Changes are live in 1-2 minutes

## Benefits of GitHub API Approach

✅ **Works in Production**: No file system limitations
✅ **Version Control**: All changes tracked in Git
✅ **Instant Updates**: With on-demand revalidation, changes are live in seconds
✅ **Rollback Capability**: Can revert posts via Git
✅ **Multi-User**: Multiple admins can work simultaneously
✅ **Audit Trail**: See who made what changes when
✅ **Backup**: GitHub serves as automatic backup
✅ **Cost Efficient**: No need for external database or CMS

## Alternative Solutions

### 1. Database Integration
Instead of files, use a database:
- **Vercel**: Use Vercel Postgres or PlanetScale
- **Netlify**: Use Fauna or Supabase
- **Self-hosted**: PostgreSQL, MySQL, MongoDB

### 2. Headless CMS
Integrate with existing CMS platforms:
- **Strapi**: Self-hosted or cloud
- **Contentful**: Enterprise-ready
- **Sanity**: Real-time collaboration
- **Directus**: Open-source option

### 3. Static Generation
Pre-build all content at build time:
- Use `getStaticProps` for blog pages
- Rebuild site when content changes
- Best for sites with infrequent updates

## Security Considerations

1. **Token Security**: Never commit tokens to repository
2. **Rate Limits**: GitHub API has rate limits (5000 requests/hour)
3. **Access Control**: Use environment variables for all secrets
4. **HTTPS Only**: Always use HTTPS in production
5. **Authentication**: Keep admin credentials strong and unique

## Troubleshooting

### Posts not appearing after save
- Check GitHub Actions/Commits in your repository
- Verify deploy webhook is triggering
- Check Vercel/Netlify build logs

### Authentication errors
- Verify GitHub token has correct permissions
- Check token hasn't expired
- Ensure environment variables are set correctly

### Rate limiting
- Implement caching for read operations
- Batch updates when possible
- Consider upgrading GitHub plan if needed

## Example Implementation

```typescript
// In your admin page component
const handleSave = async (postData: BlogPost) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const endpoint = isProduction 
    ? '/api/admin/blog-post/github' 
    : '/api/admin/blog-post';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData)
  });

  if (response.ok) {
    if (isProduction) {
      alert('Post saved! Site will update in 1-2 minutes.');
    } else {
      alert('Post saved locally!');
    }
  }
};
```

## Cost Considerations

- **GitHub API**: Free for public repos, included in GitHub plans
- **Vercel**: Free tier includes unlimited deployments
- **Netlify**: Free tier includes 300 build minutes/month
- **Storage**: Blog posts as JSON are tiny (< 1MB total usually)

## Next Steps

1. Test locally first with file system
2. Set up GitHub token and test API
3. Deploy to staging environment
4. Verify everything works
5. Deploy to production

For questions or issues, please open an issue on the repository.
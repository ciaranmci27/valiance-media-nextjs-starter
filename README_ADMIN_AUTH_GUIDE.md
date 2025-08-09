# Admin Authentication Guide

This boilerplate includes a flexible authentication system for the admin panel that can be easily configured for different use cases.

## Quick Start

### Option 1: Simple Password Authentication (Recommended for Small Projects)

1. **Generate your admin credentials:**
   ```bash
   npx tsx scripts/setup-auth.ts
   ```

2. **Add the generated environment variables to `.env.local`:**
   ```env
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD_HASH=your_generated_hash
   ADMIN_TOKEN=your_generated_token
   ADMIN_AUTH_PROVIDER=simple
   ```

3. **Access the admin panel:**
   - Navigate to `/admin/blog-post` or `/admin/blog`
   - You'll be redirected to `/admin/login`
   - Enter your username and password

### Option 2: Development Mode (No Authentication)

For local development, you can disable authentication entirely:

```env
DISABLE_ADMIN_AUTH=true
```

⚠️ **WARNING:** Never use this in production!

## Authentication Methods

### 1. Simple Authentication (Default)

The simplest method using username/password stored as environment variables.

**Pros:**
- Easy to set up
- No external dependencies
- Good for small projects or internal tools

**Cons:**
- Single user only
- No user management UI

### 2. Custom Authentication

Implement your own authentication logic by modifying `src/lib/auth.ts`:

```typescript
// Example: Database authentication
async function customLogin(username: string, password: string): Promise<string | null> {
  const user = await db.users.findOne({ username });
  if (user && await bcrypt.compare(password, user.passwordHash)) {
    const token = generateToken();
    await db.sessions.create({ token, userId: user.id });
    return token;
  }
  return null;
}

async function customVerification(token: string): Promise<boolean> {
  const session = await db.sessions.findOne({ token, active: true });
  return !!session;
}
```

Set in `.env.local`:
```env
ADMIN_AUTH_PROVIDER=custom
```

### 3. Third-Party Authentication Providers

#### NextAuth.js Integration

1. **Install NextAuth.js:**
   ```bash
   npm install next-auth
   ```

2. **Create `/app/api/auth/[...nextauth]/route.ts`:**
   ```typescript
   import NextAuth from 'next-auth';
   import CredentialsProvider from 'next-auth/providers/credentials';
   import GoogleProvider from 'next-auth/providers/google';

   export const authOptions = {
     providers: [
       GoogleProvider({
         clientId: process.env.GOOGLE_CLIENT_ID!,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
       }),
       CredentialsProvider({
         name: 'Credentials',
         credentials: {
           username: { label: "Username", type: "text" },
           password: { label: "Password", type: "password" }
         },
         async authorize(credentials) {
           // Your authentication logic
           return { id: '1', name: 'Admin', email: 'admin@example.com' };
         }
       })
     ],
     callbacks: {
       async session({ session, token }) {
         // Add custom session properties
         return session;
       }
     }
   };

   const handler = NextAuth(authOptions);
   export { handler as GET, handler as POST };
   ```

3. **Update `src/lib/auth.ts` to use NextAuth:**
   ```typescript
   import { getServerSession } from 'next-auth';

   export async function verifyAuth(token: string): Promise<boolean> {
     const session = await getServerSession();
     return !!session;
   }
   ```

#### Clerk Integration

1. **Install Clerk:**
   ```bash
   npm install @clerk/nextjs
   ```

2. **Wrap your app with ClerkProvider in `layout.tsx`:**
   ```typescript
   import { ClerkProvider } from '@clerk/nextjs';

   export default function RootLayout({ children }) {
     return (
       <ClerkProvider>
         <html>
           <body>{children}</body>
         </html>
       </ClerkProvider>
     );
   }
   ```

3. **Update middleware to use Clerk:**
   ```typescript
   import { authMiddleware } from '@clerk/nextjs';

   export default authMiddleware({
     publicRoutes: ['/'],
     ignoredRoutes: ['/api/public'],
   });
   ```

#### Auth0 Integration

1. **Install Auth0:**
   ```bash
   npm install @auth0/nextjs-auth0
   ```

2. **Configure Auth0 in `.env.local`:**
   ```env
   AUTH0_SECRET=your_secret
   AUTH0_BASE_URL=http://localhost:3000
   AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
   AUTH0_CLIENT_ID=your_client_id
   AUTH0_CLIENT_SECRET=your_client_secret
   ```

3. **Create API route `/app/api/auth/[auth0]/route.ts`:**
   ```typescript
   import { handleAuth } from '@auth0/nextjs-auth0';
   export const GET = handleAuth();
   ```

#### Supabase Auth Integration

1. **Install Supabase:**
   ```bash
   npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
   ```

2. **Create Supabase client:**
   ```typescript
   import { createClient } from '@supabase/supabase-js';

   const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   );
   ```

3. **Use Supabase auth in your auth logic:**
   ```typescript
   export async function verifyAuth(token: string): Promise<boolean> {
     const { data: { user } } = await supabase.auth.getUser(token);
     return !!user;
   }
   ```

## Security Best Practices

1. **Always use HTTPS in production** - Cookies are set with `secure: true` in production
2. **Use strong passwords** - Minimum 12 characters with mixed case, numbers, and symbols
3. **Rotate tokens regularly** - Generate new tokens periodically
4. **Implement rate limiting** - Prevent brute force attacks
5. **Add 2FA** - Consider adding two-factor authentication for extra security
6. **Audit logs** - Track admin actions for security monitoring

### Built-in Security Features

The authentication system includes several security features out of the box:

- **Brute Force Protection**: Automatic account lockout after 5 failed login attempts within 15 minutes
- **Session Timeout**: Sessions automatically expire after 30 minutes of inactivity
- **Secure Session Management**: Sessions are properly invalidated on logout and timeout
- **CSRF Protection**: All admin routes are protected against cross-site request forgery
- **XSS Prevention**: Input sanitization and output encoding throughout the admin panel

## Environment Variables Reference

```env
# Authentication Provider (simple, custom, jwt, oauth)
ADMIN_AUTH_PROVIDER=simple

# Simple Auth Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=generated_hash
ADMIN_TOKEN=generated_token

# Development Only
DISABLE_ADMIN_AUTH=true  # Disables all authentication

# Third-Party Providers (examples)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

## Password Reset / Recovery

### Forgot Your Password?

Since the authentication is environment-based, resetting your password is simple and secure:

1. **Generate a new password hash:**
   ```bash
   npx tsx scripts/setup-auth.ts
   ```

2. **Update your `.env.local` file** with the new `ADMIN_PASSWORD_HASH` value

3. **Restart your development server** or redeploy if in production

That's it! No database to update, no complex reset flows. Just generate a new hash and update your environment variable.

### Why This is Actually More Secure

- **No email-based reset vulnerabilities** - Email resets can be intercepted
- **No reset tokens to expire or manage** - Simple and direct
- **No database of passwords to breach** - Everything is in environment variables
- **Instant password changes** - No waiting for emails or confirmation

### For Production Environments

When deployed to services like Vercel, Netlify, or Railway:

1. Generate new credentials locally using the setup script
2. Go to your hosting provider's dashboard
3. Update the `ADMIN_PASSWORD_HASH` environment variable
4. Redeploy or restart your application

Most hosting providers also support environment variable updates without redeployment.

## Troubleshooting

### "Unauthorized" error when accessing admin
- Check that your environment variables are properly set
- Ensure you're logged in (check for `admin-token` cookie)
- Verify the token hasn't expired or timed out due to inactivity
- Check if your account is locked due to too many failed login attempts (wait 15 minutes or restart the server)

### Can't log in with correct credentials
- Regenerate your password hash using the setup script
- Check that `ADMIN_AUTH_PROVIDER` is set correctly
- Ensure no typos in environment variable names

### Authentication works locally but not in production
- Verify all environment variables are set in production
- Check that cookies are being set with proper secure flags
- Ensure your domain supports HTTPS

## Extending Authentication

The authentication system is designed to be easily extensible. Key files to modify:

- `/src/lib/auth.ts` - Core authentication logic
- `/src/middleware.ts` - Route protection
- `/src/app/admin/login/page.tsx` - Login UI
- `/src/app/api/admin/login/route.ts` - Login API endpoint

Feel free to adapt these to your specific needs!
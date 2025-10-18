# Security

## Overview

Security is critical for SupaViewer. We handle user data, authentication, and user-generated content. This document outlines security measures, best practices, and threat mitigation strategies.

---

## Security Principles

1. **Defense in Depth**: Multiple layers of security
2. **Least Privilege**: Minimum permissions needed
3. **Fail Secure**: Errors should deny access, not grant it
4. **Never Trust Input**: Validate and sanitize everything
5. **Secure by Default**: Security enabled from start

---

## Authentication & Authorization

### Supabase Authentication

**Implementation**:
- Use Supabase Auth for all authentication
- Support email/password and OAuth (Google, GitHub)
- Enforce email verification for email/password signups
- Use secure session cookies (httpOnly, secure, sameSite)

**Session Management**:
```typescript
// Server-side session access
import { createServerClient } from '@/lib/supabase/server'

const supabase = createServerClient()
const { data: { user } } = await supabase.auth.getUser()
```

**Best Practices**:
- Never expose service role key to client
- Use anon key for client-side operations
- Refresh tokens automatically
- Session timeout after inactivity (optional)
- Logout invalidates session immediately

### Password Requirements

**Minimum Standards**:
- Minimum 8 characters
- No maximum (allow passphrases)
- No character requirements (rely on length)
- Check against common password lists (Supabase handles this)

**Password Reset Flow**:
1. User requests reset via email
2. Supabase sends secure token via email
3. Token expires after 1 hour
4. New password must be different from old
5. All sessions invalidated after reset

### OAuth Security

**Configuration**:
- Use state parameter (CSRF protection)
- Validate redirect URIs strictly
- Store OAuth tokens securely
- Never expose client secrets

**Redirect URL Whitelist**:
Only allow:
- https://supaviewer.com/auth/callback
- http://localhost:3000/auth/callback (development only)

### Admin Authorization

**Admin Role Check**:
```typescript
// Check on every admin route
async function requireAdmin() {
  const user = await getUser()
  if (!user) return redirect('/login')
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()
    
  if (profile?.role !== 'admin') {
    return redirect('/') // or throw 403
  }
}
```

**Admin Access**:
- Check role on server side (never trust client)
- Use middleware for admin routes
- Log all admin actions
- Rotate admin credentials periodically

---

## Database Security

### Row Level Security (RLS)

**Enable RLS on All Tables**:
```sql
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
```

**RLS Policies**:

**Videos**:
```sql
-- Public can read approved videos
CREATE POLICY "Public read approved videos"
ON videos FOR SELECT
TO public
USING (status = 'approved');

-- Admins can do everything
CREATE POLICY "Admin full access"
ON videos FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');
```

**Ratings**:
```sql
-- Anyone can read ratings
CREATE POLICY "Public read ratings"
ON ratings FOR SELECT
TO public
USING (true);

-- Users can insert their own ratings
CREATE POLICY "Users insert own ratings"
ON ratings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update/delete their own ratings
CREATE POLICY "Users update own ratings"
ON ratings FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
```

**Submissions**:
```sql
-- Anyone can submit (authenticated or not)
CREATE POLICY "Anyone can submit"
ON submissions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Users can view their own submissions
CREATE POLICY "Users view own submissions"
ON submissions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all submissions
CREATE POLICY "Admin view all submissions"
ON submissions FOR SELECT
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin');
```

### SQL Injection Prevention

**Never Use Raw SQL**:
```typescript
// ❌ NEVER DO THIS
const query = `SELECT * FROM videos WHERE id = '${userInput}'`

// ✅ Always use parameterized queries (Supabase handles this)
const { data } = await supabase
  .from('videos')
  .select('*')
  .eq('id', userInput)
```

**Supabase Client**:
All queries through Supabase client are parameterized automatically.

### Database Access

**Credentials**:
- Service role key: Only on server side, never in browser
- Anon key: Safe to expose, limited by RLS
- Connection string: Never expose, use environment variables

**Backup & Recovery**:
- Daily automated backups (Supabase)
- Test restoration procedure
- Encrypt backups
- Secure backup storage

---

## Input Validation

### Client-Side Validation

**Use Zod Schemas**:
```typescript
import { z } from 'zod'

const submitVideoSchema = z.object({
  title: z.string()
    .min(1, 'Title required')
    .max(120, 'Title too long')
    .trim(),
  youtube_url: z.string()
    .url('Invalid URL')
    .regex(/youtube\.com|youtu\.be/, 'Must be YouTube URL'),
  ai_tool: z.string().min(1),
  creator_email: z.string()
    .email('Invalid email')
    .optional()
})
```

**Benefits**:
- Type-safe
- Reusable
- Clear error messages
- Prevents malformed data

### Server-Side Validation

**Always Validate on Server**:
Never trust client-side validation alone.

```typescript
// API route
export async function POST(request: Request) {
  const body = await request.json()
  
  // Validate with Zod
  const result = submitVideoSchema.safeParse(body)
  if (!result.success) {
    return Response.json(
      { error: 'Validation failed', details: result.error },
      { status: 400 }
    )
  }
  
  // Proceed with validated data
  const data = result.data
  // ...
}
```

### Sanitization

**HTML/Script Injection**:
```typescript
// Sanitize user input before rendering
import DOMPurify from 'isomorphic-dompurify'

const sanitized = DOMPurify.sanitize(userInput)
```

**URL Validation**:
```typescript
// Validate YouTube URLs strictly
function validateYouTubeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.hostname.includes('youtube.com') || 
           parsed.hostname.includes('youtu.be')
  } catch {
    return false
  }
}
```

**File Uploads** (Future):
If allowing file uploads:
- Validate file type (don't trust MIME type)
- Limit file size (e.g., 5MB max)
- Scan for malware
- Store in isolated storage (Supabase Storage)
- Never execute uploaded files

---

## XSS Prevention

### Content Security Policy (CSP)

**Set in next.config.js**:
```typescript
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https: blob:;
      font-src 'self' data:;
      frame-src https://www.youtube.com;
      connect-src 'self' https://*.supabase.co;
    `.replace(/\s+/g, ' ').trim()
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ]
  }
}
```

### React Protection

React escapes values by default:
```typescript
// ✅ Safe: React escapes automatically
<div>{userInput}</div>

// ❌ Dangerous: Bypasses escaping
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

**Only use dangerouslySetInnerHTML for**:
- Sanitized HTML (with DOMPurify)
- Trusted content (admin-created)

---

## CSRF Protection

### Built-in Protection

**Next.js Server Actions**:
CSRF protection is built-in for Server Actions.

**API Routes**:
For API routes, implement CSRF tokens if needed:
```typescript
// Use SameSite cookies (Supabase does this)
// SameSite=Lax prevents CSRF for most cases
```

**Best Practice**:
- Use POST for mutations (not GET)
- Verify origin header on sensitive operations
- Use Supabase Auth (handles CSRF)

---

## Rate Limiting

### API Rate Limiting (Future)

**Implement for**:
- Video submissions (prevent spam)
- Rating submissions (prevent manipulation)
- Login attempts (prevent brute force)

**Implementation**:
```typescript
// Use Vercel Edge Config or Redis
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s')
})

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')
  const { success } = await ratelimit.limit(ip)
  
  if (!success) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }
  
  // Process request
}
```

**Rate Limits**:
- Submissions: 5 per hour per IP
- Ratings: 20 per hour per user
- Login: 5 attempts per 15 minutes per IP
- API calls: 100 per hour per IP (general)

---

## Secure Environment Variables

### Sensitive Data

**Never Commit**:
- API keys
- Database passwords
- OAuth secrets
- Service role keys

**Use Environment Variables**:
```env
# .env.local (gitignored)
SUPABASE_SERVICE_ROLE_KEY=super-secret-key
YOUTUBE_API_KEY=youtube-key
```

**In Vercel**:
Set environment variables in dashboard:
- Mark sensitive variables as secret
- Different values for preview vs production
- Use encrypted storage

### Variable Naming

**Prefix Convention**:
- `NEXT_PUBLIC_*`: Safe to expose in browser
- No prefix: Server-side only

```typescript
// ✅ Safe in browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

// ❌ Server-side only (would be undefined in browser)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
```

---

## HTTPS & Transport Security

### Enforce HTTPS

**Automatic with Vercel**:
- All traffic redirected to HTTPS
- HTTP Strict Transport Security (HSTS) enabled
- TLS 1.3 used

**Custom Headers**:
```typescript
// In next.config.js
{
  key: 'Strict-Transport-Security',
  value: 'max-age=31536000; includeSubDomains'
}
```

### Secure Cookies

**Supabase Auth Cookies**:
Automatically set with:
- HttpOnly: Prevents JavaScript access
- Secure: Only sent over HTTPS
- SameSite: CSRF protection

---

## Data Privacy

### GDPR Compliance

**User Rights**:
- Right to access data
- Right to delete data
- Right to export data
- Right to correct data

**Implementation** (Future):
- User data export function
- Account deletion workflow
- Privacy policy page
- Cookie consent (if using analytics)

### Data Minimization

**Collect Only What's Needed**:
- Don't require unnecessary user data
- Email optional for submissions
- Profile data optional

**Data Retention**:
- Keep submissions for audit trail
- Delete old sessions periodically
- Archive old data if needed

---

## Content Moderation

### Submission Review

**Manual Moderation**:
- All submissions reviewed by admin before publishing
- Check for:
  - Policy violations
  - Inappropriate content
  - Copyright issues
  - Spam/low quality

### Automated Checks (Future)

**Before Admin Review**:
- Check YouTube video is accessible
- Verify duration >= 30 seconds
- Detect duplicate submissions
- Flag suspicious patterns

**AI Moderation** (Future):
- Use AI to flag potentially inappropriate content
- Human review for flagged content
- Train model on platform-specific needs

---

## Logging & Monitoring

### Security Logging

**Log Important Events**:
- Failed login attempts
- Admin actions (approve, reject, delete)
- Account changes (password reset, email change)
- Unusual activity patterns

**What to Log**:
```typescript
{
  timestamp: '2025-01-15T10:30:00Z',
  event: 'admin_action',
  action: 'video_approved',
  user_id: 'admin-user-id',
  resource_id: 'video-id',
  ip_address: '1.2.3.4',
  user_agent: 'Mozilla/...'
}
```

**What NOT to Log**:
- Passwords (even hashed)
- Session tokens
- API keys
- Personal data (minimize)

### Monitoring

**Set Up Alerts**:
- Multiple failed login attempts
- Unusual admin activity
- Database errors
- API error spikes

**Use Vercel Logs**:
- View logs in Vercel dashboard
- Set up log drains to external service
- Alert on error patterns

---

## Dependency Security

### Keep Dependencies Updated

**Regular Updates**:
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Audit for vulnerabilities
npm audit
npm audit fix
```

**Automated Tools**:
- Dependabot (GitHub)
- Renovate Bot
- Snyk

**Critical Security Updates**:
- Update immediately
- Test before deploying
- Monitor security advisories

### Minimize Dependencies

**Principle**:
Fewer dependencies = smaller attack surface

**Audit Dependencies**:
- Remove unused packages
- Consider alternatives with fewer dependencies
- Evaluate security track record

---

## API Security

### Authentication

**Require Auth**:
All mutations require authentication:
```typescript
export async function POST(request: Request) {
  const user = await getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Proceed
}
```

### Input Validation

**Validate All Inputs**:
- Check data types
- Validate ranges
- Sanitize strings
- Verify references exist

### Error Handling

**Don't Leak Information**:
```typescript
// ❌ Bad: Exposes database structure
catch (error) {
  return Response.json({ error: error.message })
}

// ✅ Good: Generic error
catch (error) {
  console.error('Database error:', error)
  return Response.json({ error: 'Internal server error' })
}
```

**Error Details**:
- Log full error server-side
- Return generic message to client
- Include error ID for support

---

## Security Checklist

### Before Launch

- [ ] HTTPS enforced everywhere
- [ ] Environment variables secured
- [ ] Service role key never exposed to client
- [ ] RLS enabled on all tables
- [ ] RLS policies tested
- [ ] Input validation on all forms
- [ ] Server-side validation on all API routes
- [ ] XSS prevention measures in place
- [ ] CSRF protection enabled
- [ ] Authentication working correctly
- [ ] Admin authorization checked on all admin routes
- [ ] Password requirements enforced
- [ ] Email verification required
- [ ] OAuth configured correctly
- [ ] Security headers set
- [ ] Content Security Policy configured
- [ ] Error handling doesn't leak info
- [ ] Logging implemented (no sensitive data)
- [ ] Dependencies audited
- [ ] Rate limiting planned (even if not implemented)
- [ ] Privacy policy written
- [ ] Terms of service written

### Regular Security Tasks

**Weekly**:
- [ ] Review error logs
- [ ] Check for failed login attempts
- [ ] Monitor unusual activity

**Monthly**:
- [ ] Update dependencies
- [ ] Run security audit (npm audit)
- [ ] Review admin logs
- [ ] Test backup restoration

**Quarterly**:
- [ ] Full security audit
- [ ] Penetration testing (if budget allows)
- [ ] Review and update security policies
- [ ] Train team on security best practices

---

## Incident Response

### If Security Issue Discovered

1. **Assess Severity**:
   - Critical: Data breach, system compromise
   - High: Vulnerability that could lead to breach
   - Medium: Minor vulnerability
   - Low: Security improvement opportunity

2. **Immediate Actions**:
   - Stop the breach (if active)
   - Document everything
   - Notify team
   - Don't delete evidence

3. **Remediation**:
   - Fix the vulnerability
   - Deploy patch
   - Test thoroughly
   - Monitor for recurrence

4. **Disclosure**:
   - Notify affected users (if data breach)
   - Public disclosure if appropriate
   - Report to authorities if required (GDPR, etc.)

5. **Post-Mortem**:
   - What happened?
   - How did it happen?
   - How to prevent in future?
   - Update security measures

### Contact Information

**Security Issues**:
- Email: security@supaviewer.com
- Report via: /security page (future)

---

## Security Resources

### Learn More

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Next.js Security: https://nextjs.org/docs/app/building-your-application/configuring/security
- Supabase Security: https://supabase.com/docs/guides/platform/going-into-prod#security
- Web Security Academy: https://portswigger.net/web-security

### Tools

- OWASP ZAP: Security testing tool
- Burp Suite: Web vulnerability scanner
- npm audit: Dependency vulnerability checker
- Snyk: Automated security testing

---

Security is not a one-time task—it's an ongoing process. Stay vigilant, keep learning, and prioritize user safety.
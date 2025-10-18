# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **drsyedirfan93@gmail.com**

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information:

* Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
* Full paths of source file(s) related to the manifestation of the issue
* The location of the affected source code (tag/branch/commit or direct URL)
* Any special configuration required to reproduce the issue
* Step-by-step instructions to reproduce the issue
* Proof-of-concept or exploit code (if possible)
* Impact of the issue, including how an attacker might exploit it

## Security Best Practices

### For Users

1. **Use strong passwords** - Minimum 8 characters
2. **Enable 2FA** if available
3. **Keep your account secure** - Don't share credentials
4. **Report suspicious activity** immediately

### For Developers/Contributors

1. **Never commit secrets** - Use environment variables
2. **Validate all inputs** - Never trust user input
3. **Use parameterized queries** - Prevent SQL injection
4. **Keep dependencies updated** - Run `pnpm audit` regularly
5. **Follow secure coding practices** - See docs/security-doc.md

## Security Features

### Authentication

* Supabase Auth for secure authentication
* Google OAuth integration
* Secure session management
* Email verification for new accounts

### Authorization

* Row Level Security (RLS) policies on all tables
* Role-based access control (RBAC)
* Admin-only routes protected by middleware
* API routes validate authentication and authorization

### Data Protection

* All data encrypted in transit (HTTPS)
* Database encryption at rest (Supabase)
* Environment variables for sensitive data
* Service role key never exposed to client

### Application Security

* Content Security Policy (CSP) headers
* XSS protection headers
* CSRF protection
* Input validation and sanitization
* SQL injection prevention via Supabase client

### Infrastructure Security

* HTTPS enforced via HSTS
* Security headers configured in next.config.ts
* Regular dependency updates
* Vercel edge network for DDoS protection

## Disclosure Policy

* Security issues will be acknowledged within 48 hours
* Patches will be released ASAP after confirmation
* CVE will be requested for serious vulnerabilities
* Credit will be given to reporters (unless they wish to remain anonymous)

## Contact

For security issues: **drsyedirfan93@gmail.com**

For general issues: [GitHub Issues](https://github.com/WarriorSushi/supaviewer/issues)

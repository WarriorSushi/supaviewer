<div align="center">

# 🎬 SupaViewer

### Discover, Rate & Share AI-Generated Videos

[![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)

[Live Demo](https://supaviewer.com) · [Report Bug](https://github.com/WarriorSushi/supaviewer/issues) · [Request Feature](https://github.com/WarriorSushi/supaviewer/issues)

</div>

---

## ✨ Features

<table>
<tr>
<td>

### 🎥 For Viewers
- **Advanced Search** - Find videos by title, creator, AI tool, or genre
- **Smart Filters** - Filter by Sora, Runway, Pika, and more
- **Rating System** - Rate videos with 5-star precision (0.5 increments)
- **Creator Profiles** - Explore videos by your favorite creators
- **Responsive Design** - Beautiful on desktop, tablet, and mobile

</td>
<td>

### 👤 For Creators
- **Easy Submission** - Submit your AI-generated videos
- **Creator Pages** - Showcase your portfolio
- **Engagement Metrics** - Track views and ratings
- **Multiple AI Tools** - Support for all major platforms

</td>
</tr>
<tr>
<td>

### 🛡️ For Admins
- **Approval Workflow** - Review and approve submissions
- **Bulk Management** - Manage videos and creators efficiently
- **Real-time Stats** - Monitor platform activity
- **Advanced Filtering** - Sort by status, rating, date, and more

</td>
<td>

### 🔐 Security & Auth
- **Google OAuth** - Seamless sign-in via Supabase
- **Row Level Security** - Database-level protection
- **Role-based Access** - Admin panel with proper authorization
- **Secure by Default** - All security headers configured

</td>
</tr>
</table>

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/WarriorSushi/supaviewer.git
cd supaviewer

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run database migrations (in Supabase SQL Editor)
# Run migrations from supabase/migrations/ folder

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📦 Tech Stack

<div align="center">

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js 15 · React 19 · TypeScript · Tailwind CSS v4 |
| **Backend** | Next.js API Routes · Supabase · PostgreSQL |
| **UI Components** | shadcn/ui · Radix UI · Lucide Icons |
| **Authentication** | Supabase Auth · Google OAuth |
| **Deployment** | Vercel · Supabase Cloud |
| **Tooling** | pnpm · ESLint · Prettier |

</div>

---

## 🏗️ Project Structure

```
supaviewer/
├── app/
│   ├── (public)/          # Public pages (home, creators)
│   ├── admin/            # Admin dashboard
│   ├── api/              # API routes
│   │   ├── admin/        # Admin endpoints
│   │   ├── ratings/      # Rating system
│   │   └── submissions/  # Video submissions
│   ├── auth/             # Authentication
│   └── submit/           # Submission form
├── components/
│   ├── admin/            # Admin components
│   ├── filters/          # Search & filter
│   ├── ui/               # UI components
│   └── video/            # Video components
├── lib/
│   ├── supabase/         # Supabase client
│   └── validations.ts    # Zod schemas
├── supabase/
│   └── migrations/       # Database migrations
└── docs/                 # Documentation
```

---

## 🌍 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google OAuth (optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

See [.env.example](.env.example) for all variables and detailed instructions.

---

## 🚢 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/WarriorSushi/supaviewer)

1. **Push to GitHub** (already done!)
2. **Import to Vercel** - Connect your GitHub repository
3. **Add Environment Variables** - Copy from `.env.local`
4. **Deploy** - Vercel handles the rest!

### Post-Deployment

1. **Update Supabase**: Add `https://supaviewer.com/auth/callback` to redirect URLs
2. **Update Google OAuth**: Add production URL to authorized redirect URIs
3. **Configure Domain**: Point `supaviewer.com` to Vercel
4. **Test Production**: Verify all features work in production

See [DEPLOYMENT.md](./docs/deployment-doc.md) for detailed instructions.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [ADMIN_SETUP.md](./ADMIN_SETUP.md) | Setting up admin access |
| [SECURITY.md](./SECURITY.md) | Security policy & best practices |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contribution guidelines |
| [DESIGN_SYSTEM.md](./docs/design-system.md) | Design system & styling |
| [API_ROUTES.md](./docs/api-routes.md) | API documentation |
| [DATABASE_SCHEMA.md](./docs/database-schema.md) | Database structure |

---

## 🎨 Screenshots

<div align="center">

### Homepage
*Coming Soon - Beautiful video grid with search and filters*

### Admin Dashboard
*Coming Soon - Comprehensive admin panel with approval workflow*

### Video Submission
*Coming Soon - Easy-to-use submission form*

</div>

---

## 🐛 Troubleshooting

**Port already in use?**
```bash
lsof -ti:3000 | xargs kill -9
```

**Module not found?**
```bash
rm -rf .next node_modules
pnpm install
```

**Supabase connection issues?**
- Verify environment variables
- Check Supabase project status
- Review RLS policies

See [full troubleshooting guide](./README.md#-troubleshooting) for more solutions.

---

## 🤝 Contributing

Contributions are what make the open source community amazing! Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

---

## 📊 Project Stats

<div align="center">

![GitHub stars](https://img.shields.io/github/stars/WarriorSushi/supaviewer?style=social)
![GitHub forks](https://img.shields.io/github/forks/WarriorSushi/supaviewer?style=social)
![GitHub issues](https://img.shields.io/github/issues/WarriorSushi/supaviewer)
![GitHub pull requests](https://img.shields.io/github/issues-pr/WarriorSushi/supaviewer)
![GitHub license](https://img.shields.io/github/license/WarriorSushi/supaviewer)

</div>

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework for Production
- [Supabase](https://supabase.com/) - Open Source Firebase Alternative
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
- [Vercel](https://vercel.com/) - Platform for deploying modern web apps

---

<div align="center">

### Built with ❤️ by [WarriorSushi](https://github.com/WarriorSushi)

**[⬆ back to top](#-supaviewer)**

</div>

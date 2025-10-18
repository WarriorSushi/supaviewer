# SupaViewer

> A curated platform for discovering, rating, and submitting AI-generated videos

[![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-blue)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)

## 🎬 Overview

SupaViewer is a modern web application for exploring and discovering AI-generated videos from platforms like Sora, Runway, Pika, and more. Users can browse videos, rate their favorites, submit new content, and admins can manage submissions through a comprehensive dashboard.

### Key Features

- 🎥 **Video Discovery** - Browse AI-generated videos with advanced filtering
- ⭐ **Rating System** - 5-star rating system with 0.5 increments
- 👤 **Creator Profiles** - Dedicated pages for video creators
- 📤 **Video Submission** - Public submission form for new content
- 🔐 **Authentication** - Email/password and Google OAuth
- 🛡️ **Admin Panel** - Comprehensive management dashboard

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- pnpm package manager
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/supaviewer.git
   cd supaviewer
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Run database migrations**
   See `DATABASE_SCHEMA.md` for complete schema and setup instructions.

5. **Start development server**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- `USER_FLOWS.md` - User journey documentation
- `FEATURES.md` - Feature specifications
- `DESIGN_SYSTEM.md` - Design guidelines  
- `ADMIN_DASHBOARD.md` - Admin panel documentation
- `VERIFICATION_CHECKLIST.md` - Testing checklist
- `FINAL_SUMMARY.md` - Complete implementation summary

## 🛠️ Tech Stack

- **Next.js 15.5.6** - React framework
- **Supabase** - Database & Auth
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - Components
- **TypeScript** - Type safety

## 📄 License

All rights reserved.

---

Built with ❤️ using Next.js and Supabase

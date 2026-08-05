# Notion Clone

A feature-rich, high-performance collaborative workspace application built on Next.js, mimicking the core experience of Notion with real-time editing, document organization, AI assistance, and subscription tiers.

## Key Features

- **Document Management:** Create, delete, nest, and organize workspace pages dynamically.
- **Rich Editor:** Fully functional document editor with page cover image uploads, custom emoji pickers, and real-time content saving.
- **Notion AI Integration:** In-app AI chat modal helper to summarize, compose, and refine notes.
- **Premium Subscription & Pricing:**
  - **Free Tier:** Core access, basic storage, up to 3 AI trial messages.
  - **Pro Tier:** Up to 5 team members, advanced library, priority support.
  - **Ultimate Tier:** Unlimited team members, custom domain mapping, dedicated 24/7 support.
  - **Flexible Billing:** Switch between Monthly and Annual billing options (Annual saves 20% and shows total yearly pricing).
- **Modern Typography:** Styled globally with the premium, warm geometric font **Plus Jakarta Sans**.
- **Dark Mode Support:** Clean, native toggling between light and dark themes.

## Tech Stack

- **Framework:** Next.js (App Router with Tailwind CSS v4)
- **Database:** MongoDB (via Mongoose)
- **Authentication:** NextAuth.js
- **Icons & Styling:** Lucide React, Tailwind CSS

## Getting Started

First, make sure to set up your environment variables (e.g. `MONGODB_URI`, `NEXTAUTH_SECRET`, etc.). Refer to `.env.example` for details.

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Building for Production

To create an optimized production build:

```bash
npm run build
```

And start the production server:

```bash
npm run start
```

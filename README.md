# ☁️ Nimbus-Vault

> **Next-Generation Cloud Storage & Vault Experience with Time-Adaptive Gradients & Integrated AI**

Nimbus-Vault is a feature-rich, high-performance cloud storage web application built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, and **Supabase**. It brings intelligent file management, dynamic aesthetic customization, command palette navigation, and real-time storage analytics into one unified vault.

---

## ✨ Features

- 🌅 **Time-Adaptive Dynamic Gradients**: Immersive background and UI themes that dynamically adjust based on the current time of day (Morning Dawn, Golden Noon, Dusk Horizon, Midnight Aurora, Solar Eclipse, Neon Cyber, and Seasonal/Festival themes).
- 📁 **Advanced File Management**: Effortless file uploads, organizing, filtering, batch operations, and instant search.
- 🔍 **File Inspector & Preview**: Side-drawer inspector offering file metadata analysis, file type previews, quick actions, and direct share options.
- ⚡ **Command Palette (`Ctrl + K` / `Cmd + K`)**: Quick keyboard navigation across your entire vault, instant file search, theme switching, and quick shortcuts.
- 🤖 **AI Assistant Chat Widget**: Integrated AI agent powered by Vercel AI SDK to help search files, answer questions, and assist with storage management.
- 📊 **Storage Analytics Dashboard**: Breakdown of storage consumption, file category distribution (Images, Documents, Videos, Audio, Archives), and quota metrics.
- 🔗 **Secure Share Dialog & Link Generation**: Create custom share links with password protection, expiration dates, download permissions, and access controls.
- 📜 **Activity Log & Audit Trail**: Complete activity tracking for file operations, sharing events, authentication logs, and settings changes.
- 🔐 **Authentication & User Profile**: Built-in authentication powered by Supabase Auth with custom user profiles and settings management.
- 💳 **Billing & Subscription Plans**: Interactive billing dashboard supporting Free, Pro, and Enterprise tiers with storage upgrades.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS animations
- **Database & Auth**: [Supabase](https://supabase.com/) (`@supabase/supabase-js`, `@supabase/ssr`)
- **AI Integration**: [Vercel AI SDK](https://sdk.vercel.ai/docs) (`@ai-sdk/openai`, `ai`)
- **Icons**: [Lucide React](https://lucide.dev/)
- **UI Components**: Radix UI Primitives (`Dialog`, `Popover`, `Switch`, `Label`, `Slot`)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.17 or higher
- **npm** / **yarn** / **pnpm** / **bun**
- A **Supabase** project (for database and authentication)

### 1. Clone the Repository

```bash
git clone https://github.com/Tanmay5555/Nimbus-Vault.git
cd Nimbus-Vault
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory and populate it with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key # Optional for AI Assistant
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view Nimbus-Vault.

---

## 📂 Project Structure

```text
Nimbus-Vault/
├── src/
│   ├── app/
│   │   ├── api/             # API routes (Chat AI, Share links)
│   │   ├── auth/            # Auth callback handlers
│   │   ├── billing/         # Billing & Subscription page
│   │   ├── login/           # Login authentication page
│   │   ├── profile/         # User profile & settings page
│   │   ├── share/           # Shared file view routes
│   │   ├── signup/          # User registration page
│   │   ├── subscription/    # Plan management
│   │   ├── globals.css      # Design system & gradient themes
│   │   ├── layout.jsx       # Root layout & providers
│   │   └── page.jsx         # Main dashboard & home landing view
│   ├── components/
│   │   ├── activity-log-modal.jsx
│   │   ├── chat-widget.jsx
│   │   ├── command-palette.jsx
│   │   ├── file-inspector.jsx
│   │   ├── home-landing.jsx
│   │   ├── share-dialog.jsx
│   │   ├── storage-analytics.jsx
│   │   ├── time-gradient-selector.jsx
│   │   ├── providers/       # Theme & time gradient context providers
│   │   └── ui/              # Reusable UI primitives
│   └── utils/
│       └── supabase/        # Supabase client & server utility modules
├── public/                  # Static assets and icons
├── package.json
└── README.md
```

---

## 📝 Available Scripts

- `npm run dev` - Launches the Next.js development server.
- `npm run build` - Builds the application for production deployment.
- `npm run start` - Starts the production server.
- `npm run lint` - Runs ESLint code checks.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

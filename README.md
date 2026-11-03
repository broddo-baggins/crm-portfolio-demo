# CRM Demo - AI-Powered Customer Relationship Management

> A comprehensive, production-ready CRM demonstration showcasing modern web development practices, AI integration, and enterprise-grade features.

[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.3-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646cff.svg)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)

## ✨ Features

- **🤖 AI Assistant (NEW!)** - Context-aware AI agent on every page powered by Gemini + Groq fallback
  - Answers questions about the system, architecture, and features
  - Explains design decisions and technical choices
  - GLaDOS-inspired personality: witty, clever, and genuinely helpful
  - Landing page mode: Introduces creator, explains product vision, guides exploration
  - Dashboard mode: Deep technical assistance and feature explanations
- **AI-Powered Lead Management** - Intelligent lead scoring, qualification, and routing
- **Real-Time Conversations** - WhatsApp integration with live chat capabilities
- **Advanced Analytics** - Comprehensive dashboards with charts and reports
- **Project Management** - Full project lifecycle tracking with milestones
- **Calendar & Scheduling** - Integrated booking system with Calendly
- **Multi-Language Support** - English and Hebrew (RTL) with i18next
- **Dark Mode** - Beautiful dark theme with seamless switching
- **Demo Mode** - Full-featured demo with realistic mock data
- **Responsive Design** - Mobile-first approach with optimized layouts
- **Accessibility** - WCAG 2.1 AA compliant with Nagish integration

## 🚀 Quick Start

### Prerequisites

- **Node.js** 24.x (the version Vercel builds with; see `engines` in package.json)
- **npm** or **yarn**
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/broddo-baggins/crm-portfolio-demo.git
cd crm-portfolio-demo

# Install dependencies
npm install

# Start development server (Demo Mode enabled)
npm run dev
```

The application will be available at `http://localhost:5173`

### Demo Mode

Demo mode is enabled by default and provides:
- **20 comprehensive leads** with full contact details and BANT scores
- **2 active projects** with milestones and progress tracking
- **7 calendar events** with various meeting types
- **4 conversation threads** with realistic message exchanges
- **Full dashboard analytics** with charts and KPIs
- **AI Assistant** - Click the sparkly purple button (bottom-right) to ask questions!

No authentication required - just start and explore!

### Try the AI Assistant

Look for the **sparkly purple button** in the bottom-right corner on any page! Ask questions like:
- "Who built this?"
- "How do I log in?"
- "What is BANT scoring?"
- "How was the WhatsApp interface built?"
- "What's the tech stack?"

The AI assistant provides context-aware responses and knows the entire system inside and out!

## 📚 Documentation

- **[Documentation index](docs/README.md)** - Project structure, decisions and guides
- **[Deployment](docs/deployment/DEPLOYMENT_GUIDE.md)** - Production deployment guide
- **[Development notes](docs/development/)** - Demo data, RAG and onboarding notes
- **[Security](docs/security/SECURITY_AUDIT.md)** - Security audit
- **[Upgrade notes](docs/UPGRADE_NOTES.md)** - Dependency versions, AI models, and what was left behind

## 🛠️ Technology Stack

### Frontend
- **React 19.3** - UI library with hooks and concurrent features
- **TypeScript 6.0** - Type-safe development
- **Vite 8.3** - Rolldown-based build tool
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful, accessible component library
- **Framer Motion** - Smooth animations and transitions
- **React Router 8** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **Zustand** - State management
- **i18next** - Internationalization

### AI Integration
- **Google Gemini 3.8 Flash** - Primary model (`GEMINI_MODEL`, falls back to `GEMINI_FALLBACK_MODEL`, default `gemini-3.5-flash-lite`)
- **Groq GPT-OSS 120B** - High-speed fallback (`GROQ_MODEL`, falls back to `GROQ_FALLBACK_MODEL`, default `openai/gpt-oss-20b`)
- **Server-side only** - Keys live in the `/api/ai-assistant` Vercel function (`GOOGLE_GENERATIVE_AI_API_KEY`, `GROQ_API_KEY`); without them the assistant answers from built-in mock responses
- **RAG Knowledge Base** - Retrieval-augmented generation with 100+ documentation chunks
- **Context-Aware Responses** - Different AI behavior for landing page vs. dashboard
- **Streaming Responses** - Real-time message streaming for better UX

### Backend Integration
- **Supabase** - Database and authentication
- **PostgreSQL** - Relational database
- **Row Level Security** - Data access control
- **Edge Functions** - Serverless API endpoints

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **TypeScript** - Static type checking

## 📂 Project Structure

```
/
├── src/                    # Source code
│   ├── components/         # React components
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript types
│   ├── context/            # React context providers
│   ├── lib/                # Core libraries
│   └── data/               # Mock data and constants
├── api/                    # Vercel serverless function (AI assistant) + its tests
├── e2e/                    # Playwright end-to-end suite
├── public/                 # Static assets and locales
└── docs/                   # Documentation
```

## 🧪 Testing

```bash
npm run test            # unit tests (Vitest, app + /api function)
npm run test:e2e        # end-to-end (Playwright): builds, serves with the production CSP,
                        # every route + user flows at 1440x900 and 390x844, axe a11y checks,
                        # zero console errors / failed requests allowed
npm run test:e2e:mobile # one viewport only (also :desktop)
npm run type-check
npm run lint
npm run knip            # unused files and dependencies
npm run verify          # all of the above
```

First run only: `npx playwright install chromium`.

## 🏗️ Build & Deploy

```bash
# Production build
npm run build

# Preview production build
npm run preview

```

Vercel deploys from Git (see `vercel.json`, which also sets the Content-Security-Policy and security headers).

## 🎨 Design System

The project uses a comprehensive design system built on:
- **Shadcn/ui** components
- **Radix UI** primitives
- **Tailwind CSS** utilities
- **Custom theme** with CSS variables
- **Dark mode** support
- **Responsive breakpoints** for all screen sizes

## 🔐 Security

- **Row Level Security (RLS)** on all database tables
- **Authentication** with Supabase Auth
- **No secrets in the browser** - AI keys are only read by the server function
- **Input validation** on forms and in `/api/ai-assistant` (type, size and content-type checks)
- **XSS protection** - AI replies are escaped before rendering
- **Security headers** - CSP, HSTS, X-Frame-Options, Permissions-Policy (`vercel.json`)

## 🌍 Internationalization

Fully localized for:
- **English (en)** - Primary language
- **Hebrew (he)** - RTL support with proper layout

## 📱 Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

## 📈 Performance

- Minified production build with route-level code splitting (main chunk ~680 KB before gzip)

## 🤝 Contributing

Contributions are welcome: open an issue or a pull request, and run `npm run verify` before submitting.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

**Project Lead**: Amit Yogev
**Repository**: [github.com/broddo-baggins/crm-portfolio-demo](https://github.com/broddo-baggins/crm-portfolio-demo)

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Components from [Shadcn/ui](https://ui.shadcn.com/)
- Backend by [Supabase](https://supabase.com/)
- Deployed on [Vercel](https://vercel.com/)

## 📞 Support

For questions, issues, or feature requests:
- **AI Assistant**: Click the sparkly button in the app for instant help!
- **Issues**: [GitHub Issues](https://github.com/broddo-baggins/crm-portfolio-demo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/broddo-baggins/crm-portfolio-demo/discussions)

---

**Made with ❤️ by the CRM Demo Team**

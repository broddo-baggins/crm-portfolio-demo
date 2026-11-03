/**
 * RAG Knowledge Base Service
 * 
 * Provides document-based knowledge for the AI agent using Retrieval-Augmented Generation (RAG).
 * Implements simple keyword-based search for fast, dependency-free operation.
 */

export interface DocumentChunk {
  id: string;
  title: string;
  content: string;
  source: string;
  category: 'architecture' | 'features' | 'fixes' | 'deployment' | 'security' | 'development';
  keywords: string[];
}

/**
 * Knowledge base built from project documentation
 * This is pre-processed at build time for fast runtime performance
 */
export const knowledgeBase: DocumentChunk[] = [
  // Project Structure & Architecture
  {
    id: 'project-structure',
    title: 'Project Architecture & Structure',
    content: `This is a professional CRM demo built with modern web technologies.

**Tech Stack:**
- Frontend: React 18 + TypeScript + Vite
- UI: shadcn/ui components + Tailwind CSS
- Charts: Recharts for analytics
- State: Context API + React Query patterns
- Router: React Router v6
- Icons: Lucide React

**Architecture:**
The project follows a well-organized structure with:
- src/components/ - 580+ reusable components
- src/services/ - Business logic and API services
- src/pages/ - Main application pages
- src/hooks/ - Custom React hooks
- src/types/ - TypeScript type definitions
- src/utils/ - Utility functions

**Database (Original):**
- Supabase PostgreSQL with Row Level Security (RLS)
- Multi-tenant architecture
- Real-time subscriptions
- Connection pooling via PgBouncer

**Current Demo Mode:**
Uses mock data services for portfolio demonstration without requiring live backend infrastructure.`,
    source: 'docs/PROJECT_STRUCTURE.md',
    category: 'architecture',
    keywords: ['tech stack', 'architecture', 'structure', 'technologies', 'react', 'typescript', 'vite', 'supabase', 'postgresql', 'components', 'services']
  },

  // BANT Scoring
  {
    id: 'bant-methodology',
    title: 'BANT Qualification Methodology',
    content: `BANT is a B2B sales qualification framework that stands for:

**B**udget - Does the lead have financial resources?
- Scored 0-100% based on budget clarity
- Higher scores indicate confirmed budget availability
- Helps prioritize leads with purchasing power

**A**uthority - Are we talking to the decision-maker?
- Scored 0-100% based on decision-making power
- Identifies key stakeholders and influencers
- Ensures conversations with the right people

**N**eed - Do they have a genuine need for our solution?
- Scored 0-100% based on pain points and requirements
- Validates product-market fit
- Qualifies leads based on actual needs

**T**imeline - When are they looking to purchase?
- Scored 0-100% based on urgency and timeframe
- Helps forecast revenue and plan resources
- Identifies immediate vs. future opportunities

**Implementation in CRM:**
- Each lead has individual BANT scores (B, A, N, T percentages)
- Composite BANT score automatically calculated
- Scores visible in lead details and dashboard analytics
- Used for lead prioritization and pipeline forecasting
- Integration with HEAT scoring for comprehensive qualification`,
    source: 'docs/features/bant-scoring.md',
    category: 'features',
    keywords: ['bant', 'qualification', 'budget', 'authority', 'need', 'timeline', 'scoring', 'leads', 'b2b', 'sales']
  },

  // HEAT Scoring
  {
    id: 'heat-temperature',
    title: 'HEAT Temperature Scoring System',
    content: `The HEAT scoring system represents lead temperature and indicates engagement level:

🧊 **Cold (0-25%)** - Initial contact, gathering information
- Just entered the system
- Limited engagement
- Early discovery phase
- Focus: Education and relationship building

🌤️ **Warm (26-50%)** - Showing interest, engaged in conversation
- Regular communication
- Asking questions about features
- Considering options
- Focus: Demonstration and value proposition

🔥 **Hot (51-75%)** - Actively considering, ready for demos
- High engagement frequency
- Discussing pricing and terms
- Meeting with decision-makers
- Focus: Proposal and negotiation

🌋 **Burning (76-100%)** - Ready to buy, high urgency
- Immediate purchase intent
- Budget approved
- Decision imminent
- Focus: Closing and onboarding

**How It Works:**
- Heat scores calculated based on BANT qualification + engagement frequency + behavior patterns
- Automatically updated as leads progress
- Used to prioritize follow-ups and allocate sales resources
- Triggers automated workflows (e.g., hot lead notifications)
- Forecasts conversion probability

**Visual Indicators:**
- Color-coded badges in lead lists
- Dashboard heat distribution charts
- Real-time temperature changes
- Historical heat trends`,
    source: 'docs/features/heat-scoring.md',
    category: 'features',
    keywords: ['heat', 'temperature', 'scoring', 'cold', 'warm', 'hot', 'burning', 'engagement', 'leads', 'priority', 'workflow']
  },

  // Agent Improvements
  {
    id: 'agent-improvements',
    title: 'AI Agent Improvements & Features',
    content: `Recent improvements to the CRM Demo Assistant (October 27, 2025):

**Markdown Rendering:**
- Custom parseMarkdown() function for proper formatting
- Supports headers, bold, italic, code blocks, lists, and links
- Purple-highlighted inline code
- Dark-themed code blocks
- Professional typography with Tailwind prose classes

**Streaming Responses:**
- Word-by-word streaming at ~33 words/second
- Natural reading pace like Claude AI
- Animated cursor indicator during typing
- Smooth 60fps animations
- Proper cleanup to prevent memory leaks

**Performance:**
- No external dependencies (no react-markdown)
- Lightweight custom parser (~50 lines)
- Efficient streaming mechanism
- Zero impact on bundle size

**User Experience:**
- Claude-like conversational flow
- Proper formatting for all markdown
- Professional appearance
- Natural conversation rhythm

The agent can answer questions about BANT scoring, HEAT levels, tech stack, features, architecture, deployment, and more!`,
    source: 'docs/fixes/AGENT_IMPROVEMENTS.md',
    category: 'fixes',
    keywords: ['agent', 'ai', 'assistant', 'markdown', 'streaming', 'improvements', 'claude', 'conversation', 'chat', 'gemini']
  },

  // WhatsApp Integration
  {
    id: 'whatsapp-integration',
    title: 'WhatsApp Business Integration',
    content: `WhatsApp Business API integration for automated lead conversations:

**Features:**
- Automated lead nurturing via WhatsApp
- BANT qualification through natural chat conversations
- Template message management for compliance
- Conversation history tracking
- Real-time message status updates
- Delivery receipts and read confirmations

**AI Sales Assistant:**
The system includes an AI agent that:
- Engages leads via WhatsApp naturally
- Asks BANT qualifying questions conversationally
- Escalates hot leads to human sales agents
- Follows up automatically based on heat scores
- Maintains conversation context
- Adapts messaging based on lead behavior

**Analytics:**
- Message delivery rates and open rates
- Response times and engagement metrics
- Conversion funnel: message → meeting
- Engagement patterns and timing analysis
- A/B testing for message templates

**Technical Details:**
- Powered by Meta WhatsApp Business API
- Webhook authentication and validation
- Message queue for reliability
- Rate limiting and quota management
- Compliance with WhatsApp policies

**Demo Note:**
In this portfolio demo, WhatsApp integration uses mock data. The production version connects to Meta's Business API with full webhook authentication.`,
    source: 'docs/features/whatsapp-integration.md',
    category: 'features',
    keywords: ['whatsapp', 'messaging', 'meta', 'business api', 'automation', 'conversations', 'chat', 'templates', 'webhooks', 'integration']
  },

  // Mock vs Real Data
  {
    id: 'demo-mock-data',
    title: 'Demo Mode & Mock Data',
    content: `This is a portfolio demonstration project by Amit Yogev. All data is mock/fictional:

**Mock Data Includes:**
- 15+ leads across different industries (real estate, tech, finance)
- 3 projects: TechStart, Enterprise Systems, Growth Marketing
- 8 users: 5 pending approval, 3 active
- 20+ WhatsApp conversations with realistic dialogue
- 22 calendar meetings with varied statuses
- Dashboard analytics and performance metrics
- BANT/HEAT scores and distributions

**Purpose:**
Showcases a production-quality CRM system with:
- BANT/HEAT lead management methodology
- WhatsApp Business integration
- Real-time analytics and dashboards
- Multi-project support
- User management
- All without requiring live backend infrastructure

**Original Architecture:**
Built with Supabase PostgreSQL:
- Row Level Security (RLS) for data isolation
- Real-time webhooks for lead updates
- Multi-tenant architecture
- WhatsApp Business API integration via Meta
- Calendly API for meeting scheduling

**Demo Mode:**
Uses mock data services:
- No actual API calls to external services
- Changes are session-only (not persisted)
- Perfect for portfolio demonstration
- Shows all features without infrastructure costs
- Realistic data that demonstrates capabilities

**Contact:**
- Email: amit.yogev@gmail.com
- Website: https://amityogev.com`,
    source: 'docs/development/DEMO_NOTES.md',
    category: 'development',
    keywords: ['demo', 'mock', 'fake', 'portfolio', 'data', 'test', 'sample', 'showcase', 'amit', 'yogev']
  },

  // Deployment
  {
    id: 'deployment-vercel',
    title: 'Vercel Deployment Guide',
    content: `Deploy the CRM demo to Vercel:

**Prerequisites:**
- Vercel account
- GitHub repository connected to Vercel
- Environment variables configured

**Deployment Steps:**
1. Connect GitHub repo to Vercel project
2. Configure build settings:
   - Framework Preset: Vite
   - Build Command: npm run build
   - Output Directory: dist
   - Install Command: npm install

3. Set environment variables:
   - VITE_DEMO_MODE=true (for demo without backend)
   - GOOGLE_GENERATIVE_AI_API_KEY=your_key (optional, for AI agent)
   - VITE_SUPABASE_URL (if using real backend)
   - VITE_SUPABASE_ANON_KEY (if using real backend)

4. Deploy: git push to main branch

**Automatic Deployments:**
- Push to main → Production deployment
- Pull requests → Preview deployments
- Automatic builds on every commit

**Performance:**
- Edge network deployment globally
- Automatic HTTPS
- CDN optimization for static assets
- Fast cold starts
- Analytics and monitoring included

**Demo Mode:**
Set VITE_DEMO_MODE=true for portfolio demo without needing Supabase or external APIs. All features work with mock data.`,
    source: 'docs/deployment/DEPLOYMENT_GUIDE.md',
    category: 'deployment',
    keywords: ['deployment', 'vercel', 'deploy', 'production', 'hosting', 'build', 'github', 'ci/cd', 'environment', 'variables']
  },

  // Security
  {
    id: 'security-practices',
    title: 'Security & RLS Policies',
    content: `Security practices and Row Level Security (RLS):

**Authentication:**
- Supabase Auth for user management
- JWT token-based authentication
- Session management and refresh tokens
- OAuth providers support
- Multi-factor authentication support

**Row Level Security (RLS):**
- Tenant isolation at database level
- User can only access their organization's data
- Policies enforce access control automatically
- No way to bypass security at application level
- Tested and verified isolation

**API Security:**
- API key management for external services
- Environment variables for sensitive data
- CORS configuration for API endpoints
- Rate limiting on API routes
- Webhook signature verification

**Data Protection:**
- Encrypted connections (HTTPS/TLS)
- No sensitive data in client-side code
- Environment variables never committed
- .gitignore configured properly
- Secrets stored securely in Vercel

**Demo Mode Security:**
- Mock data only, no real user information
- No database connections required
- No API keys needed (except optional Gemini)
- Safe for public portfolio demonstration

**Best Practices:**
- Regular dependency updates
- Security audit logs
- Access control reviews
- Principle of least privilege
- Input validation and sanitization`,
    source: 'docs/security/SECURITY_AUDIT.md',
    category: 'security',
    keywords: ['security', 'rls', 'row level security', 'authentication', 'authorization', 'supabase', 'auth', 'jwt', 'api', 'keys', 'encryption']
  },

  // Features Overview
  {
    id: 'features-overview',
    title: 'CRM Features & Capabilities',
    content: `Key features of the CRM Demo:

**Dashboard & Analytics:**
- Real-time metrics and KPIs
- BANT/HEAT lead distribution charts
- Monthly performance trends
- Conversion funnel analysis
- Revenue forecasting
- Activity timeline

**Lead Management:**
- BANT qualification tracking (Budget, Authority, Need, Timeline)
- HEAT scoring (Cold, Warm, Hot, Burning)
- Lead progression pipeline
- Bulk actions and advanced filtering
- Custom fields and tags
- Import/export capabilities

**Conversation Management:**
- WhatsApp Business integration
- Template messages for compliance
- Conversation history tracking
- AI-powered automated responses
- Manual takeover for complex cases
- Message analytics

**Meeting Pipeline:**
- Calendly integration for scheduling
- Meeting request management
- Follow-up automation
- Calendar sync across platforms
- Meeting outcome tracking
- Booking analytics

**Project Management:**
- Multi-project support
- Client assignment per project
- Project-specific leads and conversations
- Team collaboration features
- Project-level analytics

**Admin Center:**
- User management and roles
- System settings configuration
- Security and access control
- Performance monitoring
- Activity logs and audit trail
- System health dashboard

**Notifications:**
- Real-time alerts for hot leads
- BANT qualification updates
- Meeting reminders
- System notifications
- Email and in-app notifications

**Internationalization:**
- English + Hebrew support
- RTL (Right-to-Left) layout handling
- Dynamic language switching
- Localized date/time formats`,
    source: 'docs/features/overview.md',
    category: 'features',
    keywords: ['features', 'capabilities', 'dashboard', 'leads', 'meetings', 'analytics', 'crm', 'management', 'projects', 'admin']
  },

  // Internationalization
  {
    id: 'i18n-multilanguage',
    title: 'Internationalization & RTL Support',
    content: `Multi-language support with i18next:

**Supported Languages:**
- English (en) - Default
- Hebrew (he) - Full RTL support

**Implementation:**
- i18next for translation management
- i18next-browser-languagedetector for automatic detection
- i18next-http-backend for loading translations
- react-i18next for React integration

**Translation Files:**
Located in public/locales/[lang]/:
- common.json - Shared translations
- pages.json - Page-specific content
- landing.json - Landing page content
- leads.json - Lead management terms
- dashboard.json - Dashboard labels
- And more...

**RTL (Right-to-Left) Support:**
- Automatic layout flip for Hebrew
- Text alignment adjustments
- Icon positioning
- Chart and graph RTL adaptations
- Custom useLang() hook for RTL utilities

**Language Switching:**
- Language toggle in top bar
- Persisted in localStorage
- Instant switch without reload
- Dynamic content loading
- URL-based language routing (/he for Hebrew)

**Developer Experience:**
- Type-safe translations with TypeScript
- Translation keys autocomplete
- Missing translation detection
- Easy to add new languages
- Organized by feature/page

**Best Practices:**
- No hardcoded strings in components
- Consistent translation key naming
- Pluralization support
- Number and date formatting
- Cultural considerations`,
    source: 'docs/features/i18n.md',
    category: 'features',
    keywords: ['i18n', 'internationalization', 'translation', 'hebrew', 'english', 'rtl', 'language', 'multilingual', 'localization']
  }
];

/**
 * Search the knowledge base using simple keyword matching
 * Returns top N most relevant documents
 */
export function searchKnowledgeBase(
  query: string,
  topN: number = 3
): DocumentChunk[] {
  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 2);
  
  if (queryWords.length === 0) {
    return [];
  }

  // Score each chunk based on keyword matches
  const scoredChunks = knowledgeBase.map(chunk => {
    let score = 0;
    
    // Score based on title matches (higher weight)
    queryWords.forEach(word => {
      if (chunk.title.toLowerCase().includes(word)) {
        score += 10;
      }
    });
    
    // Score based on keyword matches
    queryWords.forEach(word => {
      chunk.keywords.forEach(keyword => {
        if (keyword.includes(word) || word.includes(keyword)) {
          score += 5;
        }
      });
    });
    
    // Score based on content matches
    queryWords.forEach(word => {
      const contentLower = chunk.content.toLowerCase();
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = contentLower.match(regex);
      if (matches) {
        score += matches.length * 2;
      }
    });
    
    return { chunk, score };
  });

  // Return top N chunks with score > 0
  return scoredChunks
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map(({ chunk }) => chunk);
}

/**
 * Build context string from matched documents
 */
export function buildRAGContext(chunks: DocumentChunk[]): string {
  if (chunks.length === 0) {
    return '';
  }

  return chunks
    .map(chunk => `### ${chunk.title}\n*Source: ${chunk.source}*\n\n${chunk.content}`)
    .join('\n\n---\n\n');
}

/**
 * Get all available categories
 */
export function getCategories(): string[] {
  return Array.from(new Set(knowledgeBase.map(chunk => chunk.category)));
}

/**
 * Search within a specific category
 */
export function searchByCategory(
  category: DocumentChunk['category'],
  query?: string
): DocumentChunk[] {
  const categoryChunks = knowledgeBase.filter(chunk => chunk.category === category);
  
  if (!query) {
    return categoryChunks;
  }
  
  return searchKnowledgeBase(query).filter(chunk => chunk.category === category);
}

export const ragKnowledgeBase = {
  searchKnowledgeBase,
  buildRAGContext,
  getCategories,
  searchByCategory,
  knowledgeBase,
};

export default ragKnowledgeBase;


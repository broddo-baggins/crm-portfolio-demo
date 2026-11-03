/**
 * Gemini AI Service with Groq Fallback
 * 
 * Provides AI assistant functionality using Google's Gemini API as primary,
 * with Groq as a fallback for higher availability and reliability.
 * This service powers the CRM Demo Assistant that helps users understand
 * the application, its features, architecture, and data.
 * 
 * Fallback Chain:
 * 1. Gemini (Primary) - High quality, 50 req/day
 * 2. Groq (Fallback) - Fast LPU inference, 14,400 req/day
 * 3. Mock Responses (Final) - Always available
 *
 * Gemini and Groq are called by the /api/ai-assistant Vercel function, which holds
 * the API keys. The browser never sees a key.
 */

import { searchKnowledgeBase, type DocumentChunk } from './ragKnowledgeBase';

// Mock response when Gemini is not available
const getMockResponse = (question: string): string => {
  const q = question.toLowerCase();
  
  if (q.includes('bant') || q.includes('qualification')) {
    return `BANT is a B2B sales qualification framework that stands for:

**B**udget - Does the lead have financial resources?
**A**uthority - Are we talking to the decision-maker?
**N**eed - Do they have a genuine need for our solution?
**T**imeline - When are they looking to purchase?

In this CRM demo, each lead has BANT scores (0-100%) that help sales teams prioritize their efforts. You can see these scores in the lead details and dashboard analytics.

The system automatically calculates a composite BANT score that helps determine lead quality and prioritization.`;
  }
  
  if (q.includes('heat') || q.includes('temperature') || q.includes('scoring')) {
    return `The HEAT scoring system represents lead temperature and indicates how "hot" or engaged a lead is:

🧊 **Cold (0-25%)** - Initial contact, gathering information
🌤️ **Warm (26-50%)** - Showing interest, engaged in conversation
🔥 **Hot (51-75%)** - Actively considering, ready for demos
🌋 **Burning (76-100%)** - Ready to buy, high urgency

This demo uses heat scores to:
- Prioritize follow-ups
- Trigger automated workflows
- Allocate sales resources
- Forecast conversion probability

Heat scores are calculated based on BANT qualification, engagement frequency, and lead behavior patterns.`;
  }
  
  if (q.includes('mock') || q.includes('demo') || q.includes('fake')) {
    return `This is a **portfolio demonstration project** by Amit Yogev. All data is mock/fictional:

📊 **Mock Data Includes:**
- 15+ leads across different industries
- 3 projects (TechStart, Enterprise Systems, Growth Marketing)
- 8 users (5 pending approval, 3 active)
- Conversations, analytics, and performance metrics

🎯 **Purpose:**
This demo showcases a production-quality CRM system with BANT/HEAT lead management, WhatsApp integration, and real-time analytics - all without requiring a live backend.

💾 **Original Architecture:**
- Built with Supabase PostgreSQL
- Row Level Security (RLS) for data isolation
- Real-time webhooks for lead updates
- WhatsApp Business API (powered by Meta)

🔄 **Demo Mode:**
- Uses mock data services
- No actual API calls
- Changes are session-only
- Perfect for portfolio demonstration

**Contact:** amit.yogev@gmail.com | https://amityogev.com`;
  }
  
  if (q.includes('supabase') || q.includes('rls') || q.includes('database')) {
    return `**Original Architecture (Production):**

This CRM was originally built with Supabase as the backend:

🗄️ **Database:** PostgreSQL on Supabase
- Multi-tenant architecture
- Connection pooling via PgBouncer
- Real-time subscriptions

🔒 **Row Level Security (RLS):**
- Tenant isolation policies
- Role-based access control
- Secure data queries at database level

🔗 **Webhooks:**
- Real-time lead status updates
- WhatsApp message events
- Meeting confirmations
- BANT score calculations

📡 **Integrations:**
- WhatsApp Business API (Meta)
- Calendly for scheduling
- Email notifications

**Demo Mode:**
Currently using mock data services to showcase functionality without requiring live backend infrastructure. Perfect for portfolio demonstration!`;
  }
  
  if (q.includes('whatsapp') || q.includes('messaging')) {
    return `**WhatsApp Business Integration**

This CRM **was powered by Meta** WhatsApp Business API for automated lead conversations:

💬 **Features:**
- Automated lead nurturing
- BANT qualification via chat
- Template message management
- Conversation history tracking
- Real-time message status

🤖 **AI Sales Assistant:**
The system includes an AI agent (see System Prompt in Admin) that:
- Engages leads via WhatsApp
- Asks BANT qualifying questions naturally
- Escalates hot leads to human agents
- Follows up based on heat scores

📊 **Analytics:**
- Message delivery rates
- Response times
- Conversion funnel from message → meeting
- Engagement patterns

**Demo Note:** WhatsApp integration is mocked in this demo. In production, it connects to Meta's Business API with webhook authentication.`;
  }
  
  if (q.includes('tech') || q.includes('stack') || q.includes('architecture')) {
    return `**Tech Stack & Architecture**

🎨 **Frontend:**
- React 18 + TypeScript + Vite
- UI: shadcn/ui components + Tailwind CSS
- Charts: Recharts for analytics
- Icons: Lucide React
- State: Context API + React Query patterns
- Router: React Router v6

🌍 **Internationalization:**
- i18next for translations
- English + Hebrew support
- RTL layout handling
- Dynamic language switching

♿ **Accessibility:**
- WCAG 2.2 AA compliant
- Keyboard navigation
- Screen reader support
- Focus management
- Semantic HTML

🗄️ **Backend (Original):**
- Supabase PostgreSQL
- Row Level Security (RLS)
- Realtime subscriptions
- Edge functions

📱 **Mobile:**
- Fully responsive design
- Touch-optimized interfaces
- Mobile-first approach
- Progressive Web App (PWA) ready

🔐 **Security:**
- Authentication via Supabase Auth
- RLS policies for data isolation
- API key management
- CORS configuration

**Current Demo:** Uses mock data services for demonstration without requiring live backend.`;
  }
  
  if (q.includes('feature') || q.includes('capability') || q.includes('what can')) {
    return `**Key Features of this CRM Demo:**

📊 **Dashboard & Analytics**
- Real-time metrics and KPIs
- BANT/HEAT lead distribution
- Performance trends (monthly)
- Conversion funnel analysis

👥 **Lead Management**
- BANT qualification tracking
- Heat scoring (Cold → Warm → Hot → Burning)
- Lead progression pipeline
- Bulk actions and filtering

💬 **Conversation Management**
- WhatsApp Business integration (was powered by Meta)
- Template messages
- Conversation history
- AI-powered responses

📅 **Meeting Pipeline**
- Calendly integration
- Meeting scheduling
- Follow-up automation
- Calendar sync

🎯 **Project Management**
- Multi-project support
- Client assignment
- Project-specific leads
- Team collaboration

👔 **Admin Center**
- User management
- System settings
- Security configuration
- Performance monitoring
- Activity logs

🔔 **Notifications**
- Real-time alerts
- BANT qualification updates
- Hot lead notifications
- Meeting reminders

🌐 **Multi-language**
- English + Hebrew
- RTL support
- Dynamic switching

Would you like details on any specific feature?`;
  }
  
  // Default response
  return `I'm the CRM Demo Assistant! I can help you understand:

📚 **Topics I can explain:**
- BANT methodology and scoring
- HEAT temperature system
- Mock data and demo architecture
- Tech stack and implementation
- Supabase & RLS security
- WhatsApp integration
- System features and capabilities
- Design decisions

💡 **Try asking:**
- "How does BANT qualification work?"
- "What is the heat scoring system?"
- "What data is mock vs real?"
- "Tell me about the tech stack"
- "How was Supabase used?"

**Note:** This is a portfolio demo with mock data. For more information, contact **amit.yogev@gmail.com** or visit **https://amityogev.com**

What would you like to know?`;
};

/**
 * The AI keys live server-side in /api/ai-assistant. The browser can't know whether
 * they're configured, so assume yes until the function says otherwise (503).
 */
let aiBackendAvailable = true;

/**
 * Check if the AI backend (Gemini/Groq via /api/ai-assistant) is available
 */
export function isGeminiAvailable(): boolean {
  return aiBackendAvailable;
}

/**
 * Query the AI agent with RAG (Retrieval-Augmented Generation).
 * The prompt is built and sent to Gemini (Groq fallback) by the server function.
 */
export async function queryAgent(
  question: string,
  context?: string,
  pageContext?: 'landing' | 'dashboard'
): Promise<string> {
  // Search the knowledge base locally too, for the "sources" footer and mock mode
  const relevantDocs: DocumentChunk[] = searchKnowledgeBase(question, 3);
  const sources = relevantDocs.map(doc => `- ${doc.title} (${doc.source})`).join('\n');

  const mockFallback = (notice = '') => {
    const mock = `${notice}${getMockResponse(question)}`;
    return relevantDocs.length > 0
      ? `${mock}\n\n---\n\n**📚 Related Documentation:**\n\n${sources}`
      : mock;
  };

  if (!aiBackendAvailable) return mockFallback();

  try {
    const res = await fetch('/api/ai-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, context, pageContext }),
    });

    const isJson = res.headers.get('content-type')?.includes('application/json');
    if (res.status === 503 || res.status === 404 || !isJson) {
      // 503: no AI keys configured; 404 or HTML: no functions (e.g. vite dev/preview)
      console.warn('AI backend not available, using mock responses with RAG');
      aiBackendAvailable = false;
      return mockFallback();
    }
    if (!res.ok) throw new Error(`AI assistant HTTP ${res.status}`);

    const { text, provider } = (await res.json()) as { text?: string; provider?: 'gemini' | 'groq' };
    if (!text) return mockFallback();

    if (relevantDocs.length > 0) {
      const poweredBy = provider === 'groq' ? '\n\n*⚡ Powered by Groq (Gemini fallback)*' : '';
      // </small> on its own line: at the end of the last "- source" line it closed inside
      // that <li>, and the parser re-nested a <small> straight into the <ul> (invalid list)
      return `${text}\n\n---\n\n<small>📚 **Sources consulted:**\n${sources}${poweredBy}\n</small>`;
    }
    return text;
  } catch (error) {
    console.warn('📋 AI assistant failed, using mock responses', error);
    return mockFallback(
      `⚠️ **AI Temporarily Unavailable**\n\nBoth Gemini and Groq AI services are currently unavailable. Here's a mock response:\n\n`
    );
  }
}

/**
 * Get conversation context from history
 */
export function buildConversationContext(
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): string {
  return history
    .slice(-5) // Last 5 messages for context
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n');
}

export const geminiService = {
  queryAgent,
  isGeminiAvailable,
  buildConversationContext,
};

export default geminiService;


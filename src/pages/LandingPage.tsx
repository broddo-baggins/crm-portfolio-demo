import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  Languages,
  MessageSquare,
  Minus,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { ChatMockup } from "@/components/common/ChatMockup";
import IntegrationVisualization from "@/components/landing/IntegrationVisualization";
import FAQ from "@/components/landing/FAQ";
import { EarlyAccessForm } from "@/components/ui/EarlyAccessForm";
import { GeminiAgent } from "@/components/agent/GeminiAgent";
import { useAuth } from "@/context/ClientAuthContext";
import { requestDemo } from "@/utils/email-helper";
import { BrandLockup, BrandMark } from "@/components/brand/BrandMark";
import { HeatMeter, type Heat } from "@/components/system/HeatMeter";
import { LoadingState, ErrorState } from "@/components/system/States";
import { ProductShot } from "@/components/marketing/ProductShot";
import { LandingSeo } from "@/components/marketing/LandingSeo";
import { cn } from "@/lib/utils";

/* Landing page, Thermal design system (DESIGN.md).
   Light only (LightModeWrapper). One accent: ember marks the primary action and heat. */

const container = "mx-auto w-full max-w-[1200px] px-4 sm:px-8";
const h2Class =
  "text-[28px] font-semibold leading-[34px] tracking-[-0.025em] text-foreground md:text-[36px] md:leading-[42px]";
const leadClass = "mt-4 max-w-[60ch] text-[17px] leading-7 text-subtle md:text-lg md:leading-8";

interface LandingPageProps {
  /** Force a language (the /he route renders this page in Hebrew). */
  lang?: "en" | "he";
}

const LandingPage = ({ lang }: LandingPageProps = {}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t: tDefault, i18n, ready } = useTranslation("landing");
  const [error, setError] = useState<string | null>(null);
  const [isEarlyAccessOpen, setIsEarlyAccessOpen] = useState(false);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const isHebrew = lang ? lang === "he" : i18n?.language === "he";
  const t = useMemo(
    () => (lang && typeof i18n?.getFixedT === "function" ? i18n.getFixedT(lang, "landing") : tDefault),
    [lang, i18n, tDefault],
  );
  const [, setForcedLoaded] = useState(false);
  useEffect(() => {
    // A forced language may not be loaded yet (the /he route opened in an English session).
    if (lang && typeof i18n?.loadLanguages === "function") {
      i18n.loadLanguages(lang).then(() => setForcedLoaded(true));
    }
  }, [lang, i18n]);
  const L = (en: string, he: string) => (isHebrew ? he : en);
  const dir = isHebrew ? "rtl" : "ltr";

  const fallbackProcessSteps = useMemo(
    () => [
      {
        title: "Gather Your Knowledge",
        description:
          "We collect your PR, FAQs, and real sales call transcripts to understand your unique value and customer needs.",
        details: [
          "Project brochures & marketing materials",
          "Frequently asked questions",
          "Successful sales call recordings",
          "Pricing strategies & objection handling",
        ],
      },
      {
        title: "Design the Agent",
        description:
          "Our team works with your Sales Agent Design documentation to ensure the AI agent matches your brand and sales style.",
        details: ["Custom personality & tone", "Project-specific knowledge base", "Hebrew language optimization", "Sales process mapping"],
      },
      {
        title: "Deploy & Optimize",
        description:
          "We launch your AI sales agent, continuously learning and optimizing to deliver the best results for your business.",
        details: ["Live deployment & monitoring", "Performance optimization", "Continuous learning updates", "24/7 support & maintenance"],
      },
    ],
    [],
  );

  const getProcessSteps = useCallback(() => {
    try {
      const steps = t("process.steps", { returnObjects: true });
      return Array.isArray(steps) ? (steps as typeof fallbackProcessSteps) : fallbackProcessSteps;
    } catch (err) {
      console.error("Error loading process steps:", err);
      setError("Failed to load process steps");
      return fallbackProcessSteps;
    }
  }, [t, fallbackProcessSteps]);

  // Loading state: the page's own shape, not a progress bar
  if (!ready) {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <div className={cn(container, "flex h-16 items-center")}>
          <BrandLockup />
        </div>
        <div className={cn(container, "grid gap-12 pt-16 lg:grid-cols-2")}>
          <div className="space-y-4">
            <div className="skeleton h-4 w-48 rounded" />
            <div className="skeleton h-12 w-full rounded" />
            <div className="skeleton h-12 w-3/4 rounded" />
            <div className="skeleton h-5 w-2/3 rounded" />
          </div>
          <LoadingState rows={4} label="Loading application..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4" dir={dir}>
        <ErrorState
          className="max-w-md"
          title="Something went wrong"
          description={error}
          onRetry={() => window.location.reload()}
          retryLabel="Refresh Page"
        />
      </div>
    );
  }

  const stats = [
    { value: "70", unit: "%", label: L("response rate from cold leads", "שיעור תגובה מלידים קרים") },
    { value: "2.5", unit: "×", label: L("more face-to-face meetings", "יותר פגישות פנים אל פנים") },
    { value: "70", unit: "%", label: L("less manual follow-up", "פחות מעקב ידני") },
    { value: "50", unit: "+", label: L("projects run on it", "פרויקטים פעילים") },
  ];

  const journey: { heat: Heat; title: string; body: string }[] = [
    {
      heat: "cold",
      title: L("Revive", "החייאה"),
      body: L("Efficiently reviving your cold leads and old prospects.", "מחיים לידים קרים ומתעניינים ישנים ביעילות."),
    },
    {
      heat: "cool",
      title: L("Warm up", "חימום"),
      body: L(
        "Warming new leads using conversation scripts with a human journey.",
        "מחממים לידים חדשים באמצעות תסריט שיחה עם מסע אנושי.",
      ),
    },
    {
      heat: "warm",
      title: L("Book", "קביעת פגישה"),
      body: L(
        "The client books a meeting in the sales manager's calendar, at a time that suits them.",
        "הלקוח קובע פגישה ביומן של מנהל המכירות בזמן שמתאים לו.",
      ),
    },
    {
      heat: "hot",
      title: L("Hand over", "העברה"),
      body: L(
        "The sales manager gets a live summary of the conversation and everything needed to close.",
        "מנהל המכירות מקבל בלייב סיכום שיחה וכל מה שצריך כדי לסגור.",
      ),
    },
  ];

  const features = [
    {
      icon: Bot,
      title: L("Smart AI Assistant with Groq Fallback", "עוזר AI חכם עם גיבוי Groq"),
      body: L(
        "Ask the assistant anything about the system. Gemini AI with a Groq fallback (14,400 requests a day), so it stays available.",
        "שאלו את העוזר כל שאלה על המערכת. Gemini AI עם גיבוי Groq (14,400 בקשות ביום), כך שהוא תמיד זמין.",
      ),
    },
    {
      icon: MessageSquare,
      title: L("Advanced WhatsApp® Integration", "אוטומציית WhatsApp מתקדמת"),
      body: L(
        "Built on the WhatsApp® Business API, with approved message templates and full conversation management.",
        "מובנה על WhatsApp Business API, עם תבניות הודעות מאושרות וניהול שיחות מלא.",
      ),
    },
    {
      icon: Target,
      title: L("Automatic BANT/HEAT Scoring", "ציון BANT/HEAT אוטומטי"),
      body: L(
        "Every lead is scored on BANT and HEAT in real time and ranked by its chance to convert.",
        "כל ליד מקבל ציון BANT ו-HEAT בזמן אמת ומדורג לפי פוטנציאל ההמרה.",
      ),
    },
    {
      icon: TrendingUp,
      title: L("Intelligent Lead Warming", "חימום לידים אינטליגנטי"),
      body: L(
        "Leads warm up gradually, reply more often, and book themselves into the sales calendar.",
        "הלידים מתחממים בהדרגה, מגיבים יותר וקובעים פגישה ביומן המכירות בעצמם.",
      ),
    },
    {
      icon: BarChart3,
      title: L("Real-Time Analytics", "אנליטיקס בזמן אמת"),
      body: L(
        "BANT/HEAT scores, WhatsApp statistics and warming rates on one live dashboard.",
        "ציוני BANT/HEAT, סטטיסטיקות WhatsApp ואחוזי חימום בדשבורד חי אחד.",
      ),
    },
  ];

  const before = [
    L(
      "Meeting coordinators spend their day on leads that were never going to book.",
      "צוות של מתאמי פגישות מבזבז זמן על לידים לא רלוונטיים בניסיון לתאם פגישה.",
    ),
    L(
      "The CRM fills with half-logged calls, missed replies and inquiry overload.",
      "בלבול ובלגן ב-CRM עקב חוסר מענה, תיעודים חלקיים ועומס בפניות.",
    ),
    L(
      "Irrelevant meetings waste your sales managers' time and wear them down.",
      "פגישות לא רלוונטיות מבזבזות את הזמן של מנהלי המכירות ומייאשות אותם.",
    ),
  ];
  const after = [
    L("Cold leads and old prospects come back into the conversation.", "לידים קרים ומתעניינים ישנים חוזרים לשיחה."),
    L("New leads are warmed with your own scripts, at a human pace.", "לידים חדשים מתחממים עם התסריטים שלכם, בקצב אנושי."),
    L("Clients book straight into the sales manager's calendar.", "הלקוחות קובעים ישירות ביומן של מנהל המכירות."),
    L(
      "Every meeting arrives with a full conversation summary, synced to your CRM.",
      "כל פגישה מגיעה עם סיכום שיחה מלא, מסונכרן ל-CRM שלכם.",
    ),
  ];

  const comparison = [
    {
      row: L("Hebrew conversation", "שיחה בעברית"),
      generic: L("Poor Hebrew comprehension", "לא מבינים עברית ברמה גבוהה"),
      other: L("Basic Hebrew only", "עברית בסיסית בלבד"),
      ours: L("Native Hebrew with real-estate terms", "עברית טבעית עם מונחי נדל״ן"),
    },
    {
      row: L("Market knowledge", "היכרות עם השוק"),
      generic: L("No Israeli market knowledge", "לא מכירים את השוק הישראלי"),
      other: L("Focus on foreign markets", "מיקוד על שווקים זרים"),
      ours: L("Built for Israeli Real Estate", "מיוחד לנדל״ן ישראלי"),
    },
    {
      row: L("Lead heating", "חימום לידים"),
      generic: L("Basic reporting only", "דיווחים בסיסיים בלבד"),
      other: L("Expensive and inflexible", "יקר מאוד ולא גמיש"),
      ours: L("Lead temperature tracking and heat analytics", "מדד חום לידים ומעקב טמפרטורה"),
    },
    {
      row: L("Booking", "תיאום פגישות"),
      generic: L("Limited technical support", "תמיכה טכנית מוגבלת"),
      other: L("Telemarketers still needed", "עדיין צריך טלמרקטרים"),
      ours: L("Drives heated leads to Calendly meetings", "מוביל לידים מחוממים לפגישות בקלנדלי"),
    },
  ];

  const processSteps = getProcessSteps();

  return (
    <>
      <LandingSeo isHebrew={isHebrew} lang={lang ?? i18n?.language ?? "en"} />

      <div className="flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground" dir={dir}>
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-border bg-background">
          <nav className={cn(container, "flex h-16 items-center gap-6")} aria-label={L("Main", "ראשי")}>
            <Link
              to="/"
              className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <BrandLockup />
            </Link>
            <ul className="hidden items-center gap-6 text-sm font-medium text-subtle md:flex">
              <li>
                <a href="#journey" className="hover:text-foreground">{L("How it works", "איך זה עובד")}</a>
              </li>
              <li>
                <a href="#product" className="hover:text-foreground">{L("Product", "המוצר")}</a>
              </li>
              <li>
                <a href="#faq" className="hover:text-foreground">{L("FAQ", "שאלות נפוצות")}</a>
              </li>
            </ul>
            <div className="ms-auto flex items-center gap-2">
              {lang === "he" ? (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/" lang="en">English</Link>
                </Button>
              ) : (
                <LanguageToggle />
              )}
              <Button variant="outline" size="sm" onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth/login")}>
                {L("Sign in", "התחבר")}
              </Button>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero: the promise on the start side, the product itself on the end side */}
          <section className="relative border-b border-border">
            <div className={cn(container, "grid items-center gap-12 py-12 md:py-20 lg:grid-cols-2 lg:gap-14")}>
              <div className="rise">
                <p className="inline-flex items-center gap-2 text-sm font-medium text-subtle">
                  <BrandMark className="h-4 w-4" />
                  {L("Advanced Lead Heating System", "מערכת חימום לידים מתקדמת")}
                </p>
                <h1 className="mt-5 text-[40px] font-semibold leading-[44px] tracking-[-0.035em] text-foreground sm:text-5xl sm:leading-[52px] lg:text-[56px] lg:leading-[60px]">
                  {L("Cold leads, warmed up on WhatsApp.", "לידים קרים, מתחממים בוואטסאפ.")}
                </h1>
                <p className="mt-6 max-w-[46ch] text-lg leading-8 text-subtle">
                  {L(
                    "Autonomous AI that talks to every lead on WhatsApp® Business API, scores them, and books the meeting.",
                    "AI אוטונומי שמדבר עם כל ליד ב-WhatsApp Business API, מדרג אותו וקובע את הפגישה.",
                  )}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button size="lg" onClick={() => setIsEarlyAccessOpen(true)}>
                    {L("Request early access", "בקשו גישה מוקדמת")}
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                  </Button>
                  <Button size="lg" variant="ghost" asChild>
                    <a href="#journey">{L("See how it works", "איך זה עובד")}</a>
                  </Button>
                </div>
              </div>

              <div className="rise rise-delay relative lg:-me-24 xl:-me-40">
                <ProductShot
                  src="/screens/dashboard.png"
                  alt={L(
                    "The CRM Demo dashboard: total leads, BANT qualification rate, hot leads and the lead temperature distribution.",
                    "דשבורד CRM Demo: סך הלידים, שיעור הסמכת BANT, לידים חמים והתפלגות טמפרטורת הלידים.",
                  )}
                  width={1440}
                  height={900}
                  priority
                  className="aspect-[16/10]"
                />
              </div>
            </div>
          </section>

          {/* Figures, as plain data */}
          <section aria-label={L("Results", "תוצאות")} className="border-b border-border bg-surface">
            <dl className={cn(container, "grid grid-cols-2 gap-y-8 py-10 md:grid-cols-4 md:py-12")}>
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className={cn("px-0 md:px-6", i > 0 && "md:border-s md:border-border", i % 2 === 1 && "ps-4 md:ps-6")}
                >
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <span className="flex items-baseline gap-0.5 tabular-nums">
                      <span className="text-[40px] font-semibold leading-none tracking-[-0.03em] text-foreground">{s.value}</span>
                      <span className="text-2xl font-medium text-muted-foreground">{s.unit}</span>
                    </span>
                    <p className="mt-2 text-sm text-subtle">{s.label}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* The journey: the heat ramp is the content */}
          <section id="journey" className="scroll-mt-20 py-16 md:py-24">
            <div className={container}>
              <h2 className={h2Class}>{L("How a cold lead becomes a meeting", "איך ליד קר הופך לפגישה")}</h2>
              <p className={leadClass}>
                {L(
                  "We're not a chatbot. We're your dedicated sales team that never sleeps.",
                  "אנחנו לא צ'אטבוט. אנחנו צוות המכירות המסור שלך שאף פעם לא ישן.",
                )}
              </p>

              <ol className="relative mt-12 grid gap-8 md:grid-cols-4 md:gap-6">
                {/* The rail: cold steel at the start, ember at the end */}
                <span
                  aria-hidden="true"
                  className="absolute start-[7px] top-2 h-[calc(100%-1rem)] w-[2px] rounded-full md:start-0 md:top-[7px] md:h-[2px] md:w-full"
                  style={{
                    background: `linear-gradient(${isHebrew ? "to left" : "to right"}, var(--heat-cold), var(--heat-cool), var(--heat-warm), var(--heat-hot))`,
                  }}
                />
                {journey.map((step) => (
                  <li key={step.heat} className="relative ps-8 md:ps-0 md:pt-10">
                    <span
                      aria-hidden="true"
                      className="absolute start-0 top-0.5 h-4 w-4 rounded-full border-[3px] border-background md:top-0"
                      style={{ background: `var(--heat-${step.heat})` }}
                    />
                    <HeatMeter heat={step.heat} label={L(
                      { cold: "Cold", cool: "Cool", warm: "Warm", hot: "Hot" }[step.heat],
                      { cold: "קר", cool: "פושר", warm: "חם", hot: "לוהט" }[step.heat],
                    )} />
                    <h3 className="mt-3 text-lg font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-2 text-[15px] leading-6 text-subtle">{step.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* The conversation itself, beside what the agent does */}
          <section className="border-y border-border bg-sunken py-16 md:py-24">
            <div className={cn(container, "grid items-start gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16")}>
              <div className="order-2 lg:order-1">
                <ChatMockup />
              </div>
              <div className="order-1 lg:order-2">
                <h2 className={h2Class}>{L("It sounds like your best salesperson", "זה נשמע כמו איש המכירות הכי טוב שלכם")}</h2>
                <p className={leadClass}>
                  {L(
                    "Typing dots, natural delays and contextual memory. Prospects feel a real agent, not a bot.",
                    "נקודות הקלדה, השהיות טבעיות וזיכרון הקשרי. הלקוחות מרגישים סוכן אמיתי, לא בוט.",
                  )}
                </p>
                <dl className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2">
                  {features.map(({ icon: Icon, title, body }, i) => (
                    <div key={title} className={cn(i === 0 && "sm:col-span-2")}>
                      <dt className="flex items-center gap-2.5 text-[15px] font-semibold text-foreground">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-foreground">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        {title}
                      </dt>
                      <dd className="mt-2 text-[15px] leading-6 text-subtle">{body}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </section>

          {/* The product: real captures of the running app */}
          <section id="product" className="scroll-mt-20 py-16 md:py-24">
            <div className={container}>
              <h2 className={h2Class}>{L("One workspace for the whole pipeline", "סביבת עבודה אחת לכל הצנרת")}</h2>
              <p className={leadClass}>
                {L(
                  "Leads, WhatsApp conversations and reports in one place, in English and Hebrew.",
                  "לידים, שיחות WhatsApp ודוחות במקום אחד, בעברית ובאנגלית.",
                )}
              </p>
              <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
                <figure className="lg:row-span-2">
                  <ProductShot
                    src="/screens/leads.png"
                    alt={L("The leads table with status, heat and BANT columns.", "טבלת הלידים עם עמודות סטטוס, חום ו-BANT.")}
                    width={1440}
                    height={900}
                    className="aspect-[4/3] lg:aspect-auto lg:h-[calc(100%-2.5rem)]"
                  />
                  <figcaption className="mt-3 text-sm text-subtle">
                    <span className="font-medium text-foreground">{L("Leads.", "לידים.")}</span>{" "}
                    {L("Every lead with its status, heat and BANT score.", "כל ליד עם הסטטוס, החום וציון ה-BANT שלו.")}
                  </figcaption>
                </figure>
                <figure>
                  <ProductShot
                    src="/screens/messages.png"
                    alt={L("WhatsApp conversations with each lead.", "שיחות WhatsApp עם כל ליד.")}
                    width={1440}
                    height={900}
                    className="aspect-[16/10]"
                  />
                  <figcaption className="mt-3 text-sm text-subtle">
                    <span className="font-medium text-foreground">{L("Messages.", "הודעות.")}</span>{" "}
                    {L("The agent's WhatsApp threads, ready to take over.", "שיחות ה-WhatsApp של הסוכן, מוכנות להשתלטות.")}
                  </figcaption>
                </figure>
                <figure>
                  <ProductShot
                    src="/screens/reports.png"
                    alt={L("Reports on conversions and response times.", "דוחות המרות וזמני תגובה.")}
                    width={1440}
                    height={900}
                    className="aspect-[16/10]"
                  />
                  <figcaption className="mt-3 text-sm text-subtle">
                    <span className="font-medium text-foreground">{L("Reports.", "דוחות.")}</span>{" "}
                    {L("Funnel, response times and meetings per project.", "משפך, זמני תגובה ופגישות לכל פרויקט.")}
                  </figcaption>
                </figure>
              </div>
            </div>
          </section>

          {/* Before and after */}
          <section className="border-t border-border py-16 md:py-24">
            <div className={container}>
              <h2 className={h2Class}>{L("Upgrade Your Sales Process", "שדרגו את תהליך המכירה שלכם")}</h2>
              <p className={leadClass}>
                {L(
                  "Improving conversion to meetings and deals used to take more people, more time and a lot of money.",
                  "שיפור יחסי ההמרה לפגישה ולעסקה דרש בעבר כח אדם נוסף, זמן והרבה כסף.",
                )}
              </p>
              <div className="mt-12 grid overflow-hidden rounded-lg border border-border md:grid-cols-2">
                <div className="bg-surface p-6 md:p-8">
                  <h3 className="text-base font-semibold text-subtle">{L("In the past", "בעבר")}</h3>
                  <ul className="mt-5 space-y-4">
                    {before.map((item) => (
                      <li key={item} className="flex gap-3 text-[15px] leading-6 text-subtle">
                        <Minus className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-t border-border bg-action-soft p-6 md:border-s md:border-t-0 md:p-8">
                  <h3 className="text-base font-semibold text-foreground">{L("With CRM Demo", "עם CRM Demo")}</h3>
                  <ul className="mt-5 space-y-4">
                    {after.map((item) => (
                      <li key={item} className="flex gap-3 text-[15px] leading-6 text-foreground">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-ember-600" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* How the agent is built */}
          <section className="border-t border-border bg-surface py-16 md:py-24">
            <div className={container}>
              <h2 className={h2Class}>{t("process.title", "How We Build Your Perfect Sales Agent")}</h2>
              <p className={leadClass}>{t("process.description", "")}</p>
              <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
                {processSteps.map((step, index) => (
                  <li key={step.title} className="border-t-2 border-foreground pt-5">
                    <p className="text-sm font-medium tabular-nums text-muted-foreground">
                      {L(`Step ${index + 1} of ${processSteps.length}`, `שלב ${index + 1} מתוך ${processSteps.length}`)}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-2 text-[15px] leading-6 text-subtle">{step.description}</p>
                    <ul className="mt-4 space-y-2">
                      {step.details.map((detail: string) => (
                        <li key={detail} className="flex items-start gap-2 text-sm text-subtle">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Comparison: a real table, because it is tabular */}
          <section className="border-t border-border py-16 md:py-24">
            <div className={container}>
              <h2 className={h2Class}>
                {L("Built specifically for Israeli Real Estate", "בנוי במיוחד לנדל״ן הישראלי")}
              </h2>
              <p className={leadClass}>
                {L(
                  "While others offer generic solutions, we built a system tailored to the Israeli real estate market.",
                  "בעוד שאחרים מציעים פתרונות כלליים, בנינו מערכת מותאמת לשוק הנדל״ן הישראלי.",
                )}
              </p>
              <div className="mt-10 overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[640px] text-start text-sm">
                  <caption className="sr-only">{L("CRM Demo compared with other tools", "CRM Demo בהשוואה לכלים אחרים")}</caption>
                  <thead className="bg-sunken">
                    <tr>
                      <th scope="col" className="w-[22%] px-5 py-3 text-start font-medium text-muted-foreground">
                        <span className="sr-only">{L("Capability", "יכולת")}</span>
                      </th>
                      <th scope="col" className="px-5 py-3 text-start font-medium text-subtle">{L("Generic Solutions", "פתרונות כלליים")}</th>
                      <th scope="col" className="px-5 py-3 text-start font-medium text-subtle">{L("Other Real Estate Tools", "פתרונות נדל״ן אחרים")}</th>
                      <th scope="col" className="bg-action-soft px-5 py-3 text-start font-semibold text-ember-700">CRM Demo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {comparison.map((r) => (
                      <tr key={r.row}>
                        <th scope="row" className="px-5 py-4 text-start font-medium text-foreground">{r.row}</th>
                        <td className="px-5 py-4 text-subtle">{r.generic}</td>
                        <td className="px-5 py-4 text-subtle">{r.other}</td>
                        <td className="bg-action-soft/60 px-5 py-4 font-medium text-foreground">{r.ours}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Integrations */}
          <section className="border-t border-border bg-sunken py-16 md:py-24">
            <div className={container}>
              <h2 className={h2Class}>{t("integrations.title", "Plugs into your stack")}</h2>
              <p className={leadClass}>{t("integrations.body", "")}</p>
              <div className="mt-10">
                <IntegrationVisualization />
              </div>
              <p className="mt-6 text-sm text-muted-foreground">
                {L(
                  "* Integrations marked with an asterisk are mocked for demonstration purposes.",
                  "* שילובים מסומנים בכוכבית הם הדמיות למטרות הדגמה.",
                )}
              </p>
            </div>
          </section>

          <FAQ lang={lang} />

          {/* Closing call to action */}
          {/* An ink band in both themes, so it takes the dark-theme tokens (action #E8784C, ink-950 on it). */}
          <section className="dark border-t border-border bg-ink-900 py-16 text-ink-100 md:py-20">
            <div className={cn(container, "flex flex-col gap-8 md:flex-row md:items-end md:justify-between")}>
              <div>
                <h2 className="text-[28px] font-semibold leading-[34px] tracking-[-0.025em] text-white md:text-[36px] md:leading-[42px]">
                  {t("cta.title", "Bring your next tower to life")}
                </h2>
                <p className="mt-3 max-w-[52ch] text-[17px] leading-7 text-ink-300">{t("cta.subtitle", "")}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="focus-visible:ring-offset-ink-900"
                  onClick={() => navigate("/auth/login")}
                >
                  {L("Get Started", "התחילו עכשיו")}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-ink-600 bg-transparent text-white hover:border-ink-400 hover:bg-ink-800 focus-visible:ring-offset-ink-900"
                  onClick={() => requestDemo(isHebrew)}
                >
                  {t("cta.button", "Book a Demo")}
                </Button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-ink-800 bg-ink-950 py-8 text-ink-300">
          <div className={cn(container, "flex flex-col gap-4 text-sm md:flex-row md:items-center md:justify-between")}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <BrandLockup inverse />
              <span className="text-ink-300">{t("footer.copyright")} · Built by Amit Yogev</span>
            </div>
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => setIsEarlyAccessOpen(true)}
                  className="rounded-sm hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-400"
                >
                  {t("footer.contact")}
                </button>
              </li>
              <li>
                <Link to="/privacy-policy" className="rounded-sm hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-400">
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="rounded-sm hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-400">
                  {t("footer.terms")}
                </Link>
              </li>
            </ul>
          </div>
        </footer>
      </div>

      {/* AI assistant: one quiet round button, labelled */}
      <div className="fixed bottom-5 end-5 z-50">
        <Button
          onClick={() => setIsAgentOpen(true)}
          className="h-12 gap-2 rounded-full bg-ink-900 px-4 text-white shadow-float hover:bg-ink-800"
          aria-label={isHebrew ? "שאל את העוזר החכם שלנו" : "Ask our AI Assistant"}
        >
          <Sparkles className="h-4 w-4 text-ember-300" aria-hidden="true" />
          <span className="hidden text-sm sm:inline">{L("Ask the assistant", "שאלו את העוזר")}</span>
        </Button>
      </div>

      <GeminiAgent open={isAgentOpen} onOpenChange={setIsAgentOpen} pageContext="landing" />

      <EarlyAccessForm
        isOpen={isEarlyAccessOpen}
        onClose={() => setIsEarlyAccessOpen(false)}
        language={isHebrew ? "he" : "en"}
      />
    </>
  );
};

export default LandingPage;

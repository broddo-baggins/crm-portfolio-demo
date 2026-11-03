import { Helmet } from "react-helmet-async";

/** SEO and structured data for the landing page (unchanged content, moved out of LandingPage). */
export function LandingSeo({ isHebrew, lang }: { isHebrew: boolean; lang: string }) {
  const title = isHebrew
    ? "CRM Demo - מערכת AI מתקדמת למכירות ושירות | Amit Yogev"
    : "CRM Demo - Advanced AI-Powered CRM System | Amit Yogev";
  const social = isHebrew
    ? "מערכת AI אוטונומית המייעלת את מחלקות השירות והמכירות, מותאמת אישית עבור הצרכים שלך, משפרת את אחוזי הסגירה ומחממת לידים - ללא צורך בכח אדם נוסף"
    : "Autonomous AI system that optimizes your sales and service departments, customized for your specific needs, improving close rates and warming leads - without requiring additional human resources";

  return (
    <Helmet>
      <title>
        {isHebrew
          ? "CRM Demo - מערכת AI המתקדמת למכירות ושירות | Amit Yogev"
          : "CRM Demo - Advanced AI-Powered CRM System | Amit Yogev"}
      </title>
      <meta
        name="description"
        content={
          isHebrew
            ? "מערכת AI אוטונומית המייעלת את מחלקות השירות והמכירות, מותאמת אישית עבור הצרכים שלך, משפרת את אחוזי הסגירה ומחממת לידים - ללא צורך בכח אדם נוסף."
            : "Advanced AI-powered business system. Autonomous AI that optimizes sales and service departments, improves conversion rates, and warms leads 24/7 without additional human resources. Try free simulation."
        }
      />
      <meta
        name="keywords"
        content={
          isHebrew
            ? "AI למכירות, מערכת AI עסקית, אוטומציה למכירות, צ'אטבוט חכם, CRM אוטומטי, בינה מלאכותית עסקית, לידים חמים"
            : "AI sales automation, business AI system, sales chatbot, lead warming, CRM automation, conversational AI, sales optimization, 24/7 AI agent, multilingual AI"
        }
      />
      <meta name="author" content="Amit Yogev" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href="https://crm-portfolio-demo.vercel.app" />

      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#FAFBFC" />
      <meta name="application-name" content="CRM Demo" />
      <meta name="apple-mobile-web-app-title" content="CRM Demo" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="format-detection" content="telephone=no" />

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "CRM Demo",
          description: isHebrew
            ? "מערכת AI אוטונומית המייעלת את מחלקות השירות והמכירות"
            : "Advanced AI-powered CRM system for sales and service optimization",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web-based",
          url: "https://crm-portfolio-demo.vercel.app",
          author: {
            "@type": "Person",
            name: "Amit Yogev",
            url: "https://crm-portfolio-demo.vercel.app",
          },
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
            description: isHebrew ? "סימולציה חינמית ללא אשראי" : "Free simulation without credit card",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            ratingCount: "127",
            bestRating: "5",
          },
          featureList: [
            isHebrew ? "אינטגרציה מלאה ל-CRM" : "Full CRM Integration",
            isHebrew ? "תמיכה ב-50+ שפות" : "50+ Language Support",
            isHebrew ? "זמין 24/7" : "24/7 Availability",
            isHebrew ? "AI חכם עם זיכרון קשרי" : "Smart AI with Contextual Memory",
            isHebrew ? "דשבורד בזמן אמת" : "Real-time Dashboard",
          ],
        })}
      </script>

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: isHebrew ? "איך משתלבת המערכת עם מערכות קיימות?" : "How does the system integrate with existing systems?",
              acceptedAnswer: {
                "@type": "Answer",
                text: isHebrew
                  ? "חיבור בלחיצות פשוטות ל-CRM (Salesforce, HubSpot וכו'), API ו-Webhooks להזנה אוטומטית."
                  : "Simple connection to CRM (Salesforce, HubSpot, etc.), API and Webhooks for automatic data feeding.",
              },
            },
            {
              "@type": "Question",
              name: isHebrew ? "כמה זמן לוקח להטמיע?" : "How long does implementation take?",
              acceptedAnswer: {
                "@type": "Answer",
                text: isHebrew
                  ? "הכנה ראשונית בתוך דקות, תוצאות ראשוניות כבר בשבוע הראשון לשימוש."
                  : "Initial setup within minutes, first results already in the first week of use.",
              },
            },
            {
              "@type": "Question",
              name: isHebrew ? "כמה שפות נתמכות?" : "How many languages are supported?",
              acceptedAnswer: {
                "@type": "Answer",
                text: isHebrew
                  ? "50+ שפות, NLP מתקדם עם זיכרון הקשרי המשפר חוויית משתמש."
                  : "50+ languages with advanced NLP and contextual memory for enhanced user experience.",
              },
            },
          ],
        })}
      </script>

      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://crm-portfolio-demo.vercel.app" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={social} />
      <meta property="og:image" content="https://crm-portfolio-demo.vercel.app/og-image.png" />
      <meta property="og:locale" content={isHebrew ? "he_IL" : "en_US"} />

      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content="https://crm-portfolio-demo.vercel.app" />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={social} />
      <meta property="twitter:image" content="https://crm-portfolio-demo.vercel.app/og-image.png" />

      <html lang={lang} dir={isHebrew ? "rtl" : "ltr"} />
    </Helmet>
  );
}

export default LandingSeo;

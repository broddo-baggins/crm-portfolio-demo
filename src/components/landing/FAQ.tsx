import React from 'react';
import { useTranslation } from 'react-i18next';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion } from 'framer-motion';
import { useLang } from '@/hooks/useLang';
import { cn } from '@/lib/utils';

const FAQ: React.FC<{ lang?: 'en' | 'he' }> = ({ lang }) => {
  const { t: tDefault, i18n } = useTranslation('landing');
  const { isRTL: isRTLGlobal, textStart: textStartGlobal } = useLang();
  const t = lang && typeof i18n.getFixedT === 'function' ? i18n.getFixedT(lang, 'landing') : tDefault;
  const isHebrew = lang ? lang === 'he' : i18n.language === 'he';
  const isRTL = lang ? lang === 'he' : isRTLGlobal;
  const textStart = () => (lang ? 'text-start' : textStartGlobal());

  // FAQ data using translation keys
  const faqData = [
    {
      id: 'integration',
      question: t('faq.integration.question', 'How does the system integrate with existing systems?'),
      answer: t('faq.integration.answer', 'Simple connection to CRM (Salesforce, HubSpot, etc.), API and Webhooks for automatic data feeding. The system connects to all popular platforms and syncs data in real-time.')
    },
    {
      id: 'implementation-time',
      question: t('faq.implementationTime.question', 'How long does implementation take?'),
      answer: t('faq.implementationTime.answer', 'Initial setup within minutes, first results already in the first week of use. We provide complete training and technical support throughout the entire process.')
    },
    {
      id: 'languages',
      question: t('faq.languages.question', 'How many languages are supported?'),
      answer: t('faq.languages.answer', '50+ languages with advanced NLP and contextual memory for enhanced user experience.')
    },
    {
      id: 'customization',
      question: t('faq.customization.question', 'Can the system be customized for my business?'),
      answer: t('faq.customization.answer', 'Absolutely! The system is custom-built for each business. We learn your tone, products, customers, and unique sales processes to create a perfect fit.')
    },
    {
      id: 'roi',
      question: t('faq.roi.question', 'How quickly will I see ROI?'),
      answer: t('faq.roi.answer', 'Most clients see significant improvement in the first month. Average 70% increase in cold lead responses and 2.5x more face-to-face meetings.')
    },
    {
      id: 'support',
      question: t('faq.support.question', 'What kind of support do I receive?'),
      answer: t('faq.support.answer', '24/7 support in Hebrew and English, dedicated account manager, regular training sessions and ongoing strategic consulting. We\'re here to ensure your success.')
    }
  ];

  return (
    <section
      id="faq"
      className={cn("scroll-mt-20 border-t border-border py-16 md:py-24", isRTL && "font-hebrew")}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 sm:px-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-16">
        <div className={cn("lg:sticky lg:top-24 lg:self-start", textStart())}>
          <h2 className="text-[28px] font-semibold leading-[34px] tracking-[-0.025em] text-foreground md:text-[36px] md:leading-[42px]">
            {t('faq.title', 'Frequently Asked Questions')}
          </h2>
          <p className="mt-4 max-w-[40ch] text-[17px] leading-7 text-subtle">
            {t('faq.subtitle', 'Everything you need to know about CRM Demo and how it can transform your business')}
          </p>
        </div>

        <Accordion type="single" collapsible className="border-t border-border">
          {faqData.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="border-b border-border text-start"
            >
              <AccordionTrigger
                className={cn(
                  "py-5 text-start text-base font-medium text-foreground hover:no-underline [&[data-state=open]]:text-foreground",
                  textStart()
                )}
              >
                <span className={cn("flex-1 pe-4", textStart())}>
                  {item.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className={cn(
                "max-w-[62ch] pb-5 text-[15px] leading-7 text-subtle",
                textStart()
              )}>
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ; 
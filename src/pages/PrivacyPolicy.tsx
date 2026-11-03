import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { siteSettings } from "@/lib/site-settings";
import {
  Shield,
  Lock,
  FileText,
  Users,
  Bell,
  ExternalLink,
  Info,
  Layers,
  AlertTriangle,
  Mail,
  Download,
  Trash2,
  MessageSquare,
  Database,
  Globe,
  UserCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/lib/utils";
import { LegalDocument } from "@/components/marketing/PublicPageShell";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const PrivacyPolicy = () => {
  const { t } = useTranslation("pages");
  const { isRTL } = useLang();

  // Format the last updated date
  const formattedDate = new Date(
    siteSettings.privacyUpdated,
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Set the document title and meta tags with useEffect
  useEffect(() => {
    // Set document title
    document.title = `Privacy Policy - ${siteSettings.company.name}`;

    // Add meta tags for SEO
    const metaDescription = document.createElement("meta");
    metaDescription.name = "description";
    metaDescription.content = `${siteSettings.company.name} Privacy Policy`;
    document.head.appendChild(metaDescription);

    const metaRobots = document.createElement("meta");
    metaRobots.name = "robots";
    metaRobots.content = "index,follow";
    document.head.appendChild(metaRobots);

    return () => {
      // Clean up meta tags when component unmounts
      document.head.removeChild(metaDescription);
      document.head.removeChild(metaRobots);
    };
  }, []);

  const sections = [
    {
      id: "demo-notice",
      title: "⚠️ Portfolio Demo Notice",
      icon: <AlertTriangle className="h-6 w-6 text-orange-600" />,
      content: (
        <div className="space-y-4 p-4 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
          <p className="text-orange-900 dark:text-orange-200 font-semibold text-lg">
            IMPORTANT: This is a Portfolio Demo Application
          </p>
          <p className="text-orange-800 dark:text-orange-300">
            This application is a <strong>demonstration project</strong> created by Amit Yogev for portfolio purposes only. 
            All data shown is <strong>mock/fictional data</strong> for demonstration purposes.
          </p>
          <ul className="list-disc pl-6 text-orange-800 dark:text-orange-300 space-y-1">
            <li>This is NOT a live commercial product or service</li>
            <li>No real user data is collected or stored</li>
            <li>All displayed information is fictional and for demonstration only</li>
            <li>If you want this demo taken down, please email: <a href="mailto:amit.yogev@gmail.com" className="underline font-semibold">amit.yogev@gmail.com</a></li>
          </ul>
          <p className="text-orange-800 dark:text-orange-300">
            <strong>Contact:</strong> For questions about this portfolio project, reach out to{" "}
            <a href="mailto:amit.yogev@gmail.com" className="underline font-semibold">amit.yogev@gmail.com</a>
          </p>
        </div>
      ),
    },
    {
      id: "introduction",
      title: "Introduction",
      icon: <Info className="h-6 w-6 text-primary" />,
      content: (
        <p className="text-gray-700">
          This Privacy Policy would explain how a production version of this application 
          would collect, use, disclose, and safeguard user information. Since this is a demo application 
          with mock data, no actual user data is collected or processed.
        </p>
      ),
    },
    {
      id: "information-collected",
      title: "Information We Collect",
      icon: <FileText className="h-6 w-6 text-primary" />,
      content: (
        <>
          <p className="text-gray-700">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 mt-2 text-gray-700 space-y-1">
            <li>Account information (name, email, password)</li>
            <li>Profile information</li>
            <li>Usage data and analytics</li>
            <li>Communication data</li>
          </ul>
        </>
      ),
    },
    {
      id: "how-we-use",
      title: "How We Use Your Information",
      icon: <Layers className="h-6 w-6 text-primary" />,
      content: (
        <>
          <p className="text-gray-700">We use the information we collect to:</p>
          <ul className="list-disc pl-6 mt-2 text-gray-700 space-y-1">
            <li>Provide and maintain our services</li>
            <li>Improve and personalize your experience</li>
            <li>Communicate with you about our services</li>
            <li>Comply with legal obligations</li>
          </ul>
        </>
      ),
    },
    {
      id: "data-security",
      title: "Data Storage and Security",
      icon: <Lock className="h-6 w-6 text-primary" />,
      content: (
        <p className="text-gray-700">
          We implement appropriate technical and organizational measures to
          protect your personal data against unauthorized access, alteration,
          disclosure, or destruction.
        </p>
      ),
    },
    {
      id: "your-rights",
      title: "Your Rights",
      icon: <Shield className="h-6 w-6 text-primary" />,
      content: (
        <>
          <p className="text-gray-700 mb-4">
            Under Israeli privacy laws and international regulations (GDPR,
            CCPA), you have the right to:
          </p>
          <ul className="list-disc pl-6 mt-2 text-gray-700 space-y-2">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to processing of your data</li>
            <li>Data portability - receive your data in a structured format</li>
            <li>Withdraw consent where processing is based on consent</li>
          </ul>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">
              Data Management Options:
            </h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link
                to="/data-export"
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export My Data
              </Link>
              <Link
                to="/data-deletion"
                className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Request Data Deletion
              </Link>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "cookies",
      title: "Cookies and Tracking",
      icon: <Bell className="h-6 w-6 text-primary" />,
      content: (
        <p className="text-gray-700">
          We use cookies and similar tracking technologies to track activity on
          our service and hold certain information. You can instruct your
          browser to refuse all cookies or to indicate when a cookie is being
          sent.
        </p>
      ),
    },
    {
      id: "third-party",
      title: "Third-Party Services",
      icon: <ExternalLink className="h-6 w-6 text-primary" />,
      content: (
        <p className="text-gray-700">
          We may employ third-party companies and individuals to facilitate our
          service, provide service-related services, or assist us in analyzing
          how our service is used.
        </p>
      ),
    },
    {
      id: "meta-whatsapp",
      title: "Meta WhatsApp® Business API Integration",
      icon: <Mail className="h-6 w-6 text-primary" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Our platform integrates with Meta's WhatsApp® Business API to provide messaging services. When you use our WhatsApp® features:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Message data is shared with Meta Platforms, Inc. according to their privacy policy</li>
            <li>Your business messages are processed through Meta's infrastructure</li>
            <li>Meta may collect and process message metadata for service delivery</li>
            <li>WhatsApp® message history is stored on Meta's servers</li>
            <li>We only message leads who have provided explicit consent</li>
          </ul>
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">Meta Data Sharing:</h4>
            <p className="text-green-800 text-sm">
              By using WhatsApp® Business API features, you acknowledge that message data will be shared with Meta according to their 
              <a href="https://www.whatsapp.com/legal/privacy-policy-eea" className="underline ml-1" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "children",
      title: "Children's Privacy",
      icon: <Users className="h-6 w-6 text-primary" />,
      content: (
        <p className="text-gray-700">
          Our service does not address anyone under the age of 18. We do not
          knowingly collect personally identifiable information from children
          under 18.
        </p>
      ),
    },
    {
      id: "changes",
      title: "Changes to This Policy",
      icon: <AlertTriangle className="h-6 w-6 text-primary" />,
      content: (
        <p className="text-gray-700">
          We may update our Privacy Policy from time to time. We will notify you
          of any changes by posting the new Privacy Policy on this page and
          updating the "Last updated" date.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Contact Us",
      icon: <Mail className="h-6 w-6 text-primary" />,
      content: (
        <div className="space-y-3">
          <p className="text-gray-700">
            If you have any questions about this portfolio demo, please contact:
          </p>
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <p className="font-semibold text-blue-900 dark:text-blue-200">Amit Yogev</p>
            <p className="text-blue-800 dark:text-blue-300">
              Email: <a href="mailto:amit.yogev@gmail.com" className="underline">amit.yogev@gmail.com</a>
            </p>
            <p className="text-blue-800 dark:text-blue-300">
              Website: <a href="https://amityogev.com" className="underline">https://amityogev.com</a>
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <LegalDocument
      title={t("privacy.title", "Privacy Policy")}
      updated={formattedDate}
      sections={sections}
      dir={isRTL ? "rtl" : "ltr"}
      closing={
        <p>
          By using our service, you acknowledge that you have read and
          understand this Privacy Policy.
        </p>
      }
    />
  );
};

export default PrivacyPolicy;

import React, { useEffect } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  Scale,
  FileText,
  Users,
  AlertTriangle,
  Info,
  Building2,
  Mail,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/lib/utils";
import { LegalDocument } from "@/components/marketing/PublicPageShell";

export default function TermsOfService() {
  const { t } = useTranslation("pages");
  const { isRTL, textStart } = useLang();

  // Format the last updated date
  const formattedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Set the document title and meta tags with useEffect
  useEffect(() => {
    // Set document title
    document.title = `Terms & Conditions - Portfolio Demo`;

    // Add meta tags for SEO
    const metaDescription = document.createElement("meta");
    metaDescription.name = "description";
    metaDescription.content =
      "Portfolio Demo Terms & Conditions - This is a demonstration project";
    document.head.appendChild(metaDescription);

    const metaRobots = document.createElement("meta");
    metaRobots.name = "robots";
    metaRobots.content = "index,follow";
    document.head.appendChild(metaRobots);

    return () => {
      // Clean up meta tags when component unmounts
      if (document.head.contains(metaDescription)) {
        document.head.removeChild(metaDescription);
      }
      if (document.head.contains(metaRobots)) {
        document.head.removeChild(metaRobots);
      }
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
            <li>These terms are templates for demonstration purposes</li>
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
        <div className="space-y-4">
          <p className="text-foreground">
            This is a demo application showcasing an AI-powered CRM and lead
            generation platform. These Terms & Conditions are provided as examples
            of what a production service would include.
          </p>
          <p className="text-foreground">
            Since this is a portfolio demonstration with mock data, these terms
            do not represent an actual service agreement.
          </p>
        </div>
      ),
    },
    {
      id: "definitions",
      title: "Definitions",
      icon: <FileText className="h-6 w-6 text-primary" />,
      content: (
        <div className="space-y-2">
          <p className="text-gray-700">For demonstration purposes, these definitions show how a production service would be structured:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>
              <strong>"Company"</strong> would refer to the service provider
            </li>
            <li>
              <strong>"Service"</strong> would refer to the CRM platform
            </li>
            <li>
              <strong>"User"</strong> would refer to the individual accessing the service
            </li>
            <li>
              <strong>"Content"</strong> would refer to any data, text, or materials
            </li>
            <li>
              <strong>"AI Agent"</strong> would refer to the automated conversation system
            </li>
          </ul>
          <p className="text-sm text-gray-600 mt-3 italic">
            Note: This is a portfolio demo - no actual service agreement exists.
          </p>
        </div>
      ),
    },
    {
      id: "account",
      title: "Your Account",
      icon: <Users className="h-6 w-6 text-primary" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            You are responsible for maintaining the security of your account and
            for all activities that occur under your account. You must
            immediately notify us of any unauthorized use of your account or any
            other breach of security.
          </p>
          <p className="text-gray-700">
            You agree to provide accurate, current, and complete information
            during registration and to update such information to keep it
            accurate, current, and complete.
          </p>
        </div>
      ),
    },
    {
      id: "acceptable-use",
      title: "Acceptable Use",
      icon: <Shield className="h-6 w-6 text-primary" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">You agree not to:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>
              Use the Services for any illegal purpose or in violation of any
              laws
            </li>
            <li>
              Violate any laws in your jurisdiction (including but not limited
              to copyright laws)
            </li>
            <li>Infringe upon the rights of others</li>
            <li>
              Interfere with or disrupt the Services or servers connected to the
              Services
            </li>
            <li>
              Attempt to gain unauthorized access to any portion of the Services
            </li>
            <li>Use the AI Agent to send spam or unsolicited communications</li>
            <li>
              Upload or transmit viruses or any other type of malicious code
            </li>
            <li>
              Collect or harvest any personally identifiable information from
              the Services
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "ai-services",
      title: "AI Services and Limitations",
      icon: <Building2 className="h-6 w-6 text-primary" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Our AI Agent provides automated conversation and lead management
            services. While we strive for accuracy, AI-generated content may not
            always be perfect or appropriate for every situation.
          </p>
          <p className="text-gray-700">You acknowledge that:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>
              AI responses are generated automatically and may require human
              oversight
            </li>
            <li>
              You are responsible for reviewing and approving AI-generated
              communications
            </li>
            <li>
              We do not guarantee the accuracy or appropriateness of
              AI-generated content
            </li>
            <li>
              You should comply with all applicable laws regarding automated
              communications
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "whatsapp-usage",
      title: "WhatsApp® Business API Usage",
      icon: <Mail className="h-6 w-6 text-primary" />,
      content: (
        <div className="space-y-4">
          <p>
            Our platform integrates with Meta's WhatsApp® Business API. By using these features, you agree to:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Comply with Meta's WhatsApp® Business API Terms of Service</li>
            <li>Respect recipient privacy and consent requirements</li>
            <li>Use messaging features only for legitimate business purposes</li>
            <li>Follow WhatsApp® Business messaging policies and guidelines</li>
            <li>Maintain accurate business information and verification status</li>
            <li>Ensure your business is properly verified for WhatsApp® Business API usage</li>
            <li>Report any violations or abuse of the messaging system</li>
          </ul>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            You are responsible for maintaining compliance with WhatsApp® Business API policies. 
            Violations may result in suspension of messaging features.
          </p>
        </div>
      ),
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property",
      icon: <Scale className="h-6 w-6 text-primary" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            All content, features, and functionality of the Services are owned
            by the Service Provider and are protected by international copyright,
            trademark, and other intellectual property laws.
          </p>
          <p className="text-gray-700">
            You retain ownership of any content you upload to the Services, but
            grant us a license to use, modify, and display such content as
            necessary to provide the Services.
          </p>
        </div>
      ),
    },
    {
      id: "data-privacy",
      title: "Data and Privacy",
      icon: <Shield className="h-6 w-6 text-primary" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Your privacy is important to us. Please review our Privacy Policy,
            which also governs your use of the Service, to understand our
            practices.
          </p>
          <p className="text-gray-700">
            By using our Service, you agree to the collection and use of
            information in accordance with our Privacy Policy.
          </p>
        </div>
      ),
    },
    {
      id: "payment-billing",
      title: "Payment and Billing",
      icon: <FileText className="h-6 w-6 text-primary" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Paid services are billed in advance on a monthly or annual basis.
            You will be charged for the upcoming billing period upon
            subscription.
          </p>
          <p className="text-gray-700">
            All fees are non-refundable except as required by law or as
            specifically stated in these Terms.
          </p>
        </div>
      ),
    },
    {
      id: "termination",
      title: "Termination",
      icon: <AlertTriangle className="h-6 w-6 text-primary" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            We may terminate or suspend your access to the Services immediately,
            without prior notice or liability, for any reason, including if you
            breach these Terms.
          </p>
          <p className="text-gray-700">
            Upon termination, your right to use the Services will cease
            immediately. If you wish to terminate your account, you may simply
            discontinue using the Services.
          </p>
        </div>
      ),
    },
    {
      id: "limitation-liability",
      title: "Limitation of Liability",
      icon: <Scale className="h-6 w-6 text-primary" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            To the maximum extent permitted by law, the Service Provider shall not be liable
            for any indirect, incidental, special, consequential, or punitive
            damages resulting from your use of or inability to use the Services.
          </p>
          <p className="text-gray-700">
            In no event shall our total liability to you for all damages exceed
            the amount paid by you to the Service Provider in the twelve (12) months preceding
            the claim.
          </p>
        </div>
      ),
    },
    {
      id: "governing-law",
      title: "Governing Law",
      icon: <Scale className="h-6 w-6 text-primary" />,
      content: (
        <p className="text-gray-700">
          These Terms shall be governed by and construed in accordance with the
          laws of the State of Israel, without regard to its conflict of law
          provisions. Any disputes arising from these Terms will be subject to
          the exclusive jurisdiction of the courts of Tel Aviv, Israel.
        </p>
      ),
    },
    {
      id: "changes",
      title: "Changes to Terms",
      icon: <AlertTriangle className="h-6 w-6 text-primary" />,
      content: (
        <p className="text-gray-700">
          We reserve the right to modify these Terms at any time. We will notify
          you of any changes by posting the new Terms on this page and updating
          the "Last updated" date. Your continued use of the Service after such
          modifications constitutes acceptance of the updated Terms.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Contact Us",
      icon: <Mail className="h-6 w-6 text-primary" />,
      content: (
        <div className="space-y-4">
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
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-2">
              This is a portfolio demonstration project with mock data.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <LegalDocument
      title={t("terms.title", "Terms & Conditions")}
      updated={formattedDate}
      sections={sections}
      dir={isRTL ? "rtl" : "ltr"}
      closing={
        <p>
          By using our service, you acknowledge that you have read and
          understand these Terms & Conditions. See also the{" "}
          <Link to="/privacy-policy" className="font-medium text-foreground underline underline-offset-4">
            Privacy Policy
          </Link>
          .
        </p>
      }
    />
  );
}

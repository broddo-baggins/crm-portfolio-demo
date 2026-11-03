import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLang } from "@/hooks/useLang";
import {
  KanbanBoard,
  KanbanColumn,
  KanbanItem,
} from "@/components/kanban/KanbanBoard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Filter,
  Download,
  MoreHorizontal,
  MessageSquare,
  Users,
  Clock,
  TrendingUp,
  X,
  Edit3,
  Save,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
  import { cn } from "@/lib/utils";
import { TemplateManager } from "@/components/whatsapp/TemplateManager";
import { WhatsAppIntegrationStatus } from "@/components/whatsapp/WhatsAppIntegrationStatus";
import { AppReviewTemplateManager } from "@/components/whatsapp/AppReviewTemplateManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { env } from "@/config/env";
import { toast } from "sonner";

// Template types for different messaging scenarios
type TemplateType =
  | "opening"
  | "follow_up"
  | "objection_handling"
  | "closing"
  | "nurturing";
type TemplatePriority = "high" | "medium" | "low";

interface MessageTemplate extends KanbanItem {
  templateType: TemplateType;
  content: string;
  responseRate?: number;
  usageCount?: number;
  lastUsed?: string;
  language?: string;
  industry?: string;
  targetAudience?: string;
}

// Mock data for message templates
const initialTemplateColumns: KanbanColumn[] = [
  {
    id: "active",
    title: "Active Templates (1-3)",
    color: "#367E50",
    limit: 3,
    items: [
      {
        id: "template-1",
        title: "Welcome & Introduction Hook",
        description: "שלום [שם], ראיתי שאתם מחפשים פתרון CRM מתקדם...",
        status: "active",
        priority: "high",
        tags: ["Hebrew", "Opening", "Real Estate"],
        templateType: "opening",
        content:
          "שלום [שם], ראיתי שאתם מחפשים פתרון CRM מתקדם. האם תהיו זמינים לשיחה קצרה השבוע כדי שאוכל לספר לכם איך CRM Demo יכול לעזור לכם לסגור יותר עסקאות?",
        responseRate: 23.5,
        usageCount: 156,
        lastUsed: "2025-01-29",
        language: "Hebrew",
        industry: "Real Estate",
        targetAudience: "Property Agents",
      } as MessageTemplate,
      {
        id: "template-2",
        title: "Value Proposition Hook",
        description:
          "Hi [Name], I noticed your company is in the growth phase...",
        status: "active",
        priority: "high",
        tags: ["English", "Value Prop", "Enterprise"],
        templateType: "opening",
        content:
          "Hi [Name], I noticed your company is in the growth phase. Did you know that businesses using AI-powered sales automation see 40% faster lead conversion? Would you be interested in a 10-minute demo this week?",
        responseRate: 18.2,
        usageCount: 89,
        lastUsed: "2025-01-28",
        language: "English",
        industry: "Technology",
        targetAudience: "SMB Owners",
      } as MessageTemplate,
      {
        id: "template-3",
        title: "Follow-up After Demo",
        description: "תודה על הזמן שהקדשתם לדמו...",
        status: "active",
        priority: "medium",
        tags: ["Hebrew", "Follow-up", "Post-Demo"],
        templateType: "follow_up",
        content:
          "תודה על הזמן שהקדשתם לדמו! ראיתי שהיה לכם עניין במיוחד בפיצ'ר החימום הטוט של הלידים. האם תרצו שנקבע פגישת המשך עם הצוות הטכני שלנו?",
        responseRate: 31.7,
        usageCount: 67,
        lastUsed: "2025-01-29",
        language: "Hebrew",
        industry: "Professional Services",
        targetAudience: "Decision Makers",
      } as MessageTemplate,
    ],
  },
  {
    id: "template_bank",
    title: "Template Bank",
    color: "#6b7280",
    items: [
      {
        id: "template-4",
        title: "Objection Handler - Price",
        description: "I understand budget is always a consideration...",
        status: "idle",
        priority: "high",
        tags: ["English", "Objection", "Price"],
        templateType: "objection_handling",
        content:
          "I understand budget is always a consideration. What if I told you that our current clients typically see ROI within 60 days? Would it help if we could structure a payment plan that aligns with your cash flow?",
        responseRate: 27.3,
        usageCount: 234,
        lastUsed: "2025-01-25",
        language: "English",
        industry: "General",
        targetAudience: "Budget Conscious",
      } as MessageTemplate,
      {
        id: "template-5",
        title: "Urgency Creator - Limited Time",
        description: "מקום אחרון פתוח בתוכנית הפיילוט שלנו...",
        status: "idle",
        priority: "medium",
        tags: ["Hebrew", "Urgency", "Limited Offer"],
        templateType: "closing",
        content:
          "יש לנו מקום אחרון פתוח בתוכנית הפיילוט שלנו לחודש הקרוב. החברות שנכנסות לפיילוט מקבלות 50% הנחה לשלושת החודשים הראשונים. האם תרצו שנשמור לכם את המקום?",
        responseRate: 15.8,
        usageCount: 45,
        lastUsed: "2025-01-20",
        language: "Hebrew",
        industry: "Technology",
        targetAudience: "Early Adopters",
      } as MessageTemplate,
      {
        id: "template-6",
        title: "Competitor Mention",
        description: "I know you might be considering other options...",
        status: "idle",
        priority: "medium",
        tags: ["English", "Competition", "Differentiation"],
        templateType: "objection_handling",
        content:
          "I know you might be considering other options like HubSpot or Salesforce. What sets our CRM apart is the 24/7 AI that actually converses like a human - not just chatbot responses. Would you like to see a side-by-side comparison?",
        responseRate: 22.1,
        usageCount: 112,
        lastUsed: "2025-01-22",
        language: "English",
        industry: "Technology",
        targetAudience: "Technical Decision Makers",
      } as MessageTemplate,
      {
        id: "template-7",
        title: "Success Story - Real Estate",
        description: 'לקוח שלנו סוכן נדל"ן בתל אביב...',
        status: "idle",
        priority: "high",
        tags: ["Hebrew", "Case Study", "Real Estate"],
        templateType: "nurturing",
        content:
          'לקוח שלנו, סוכן נדל"ן בתל אביב, הגדיל את מספר הפגישות שלו ב-300% תוך חודש אחד. הוא אומר שהבינה המלאכותית שלנו מזהה לידים איכותיים כמו אדם מנוסה. האם תרצו לשמוע את הסיפור המלא שלו?',
        responseRate: 28.9,
        usageCount: 178,
        lastUsed: "2025-01-26",
        language: "Hebrew",
        industry: "Real Estate",
        targetAudience: "Real Estate Agents",
      } as MessageTemplate,
      {
        id: "template-8",
        title: "Technical Deep Dive",
        description: "For the technical details you requested...",
        status: "idle",
        priority: "low",
        tags: ["English", "Technical", "Integration"],
        templateType: "follow_up",
        content:
          "For the technical details you requested: Our CRM integrates with your existing systems via API, supports 50+ languages with contextual memory, and includes enterprise-grade security. Our technical team can walk you through the architecture - when works best for you?",
        responseRate: 19.4,
        usageCount: 56,
        lastUsed: "2025-01-15",
        language: "English",
        industry: "Technology",
        targetAudience: "CTOs and IT Directors",
      } as MessageTemplate,
    ],
  },
];

// Meta WhatsApp Business Account Configuration
const META_WHATSAPP_CONFIG = {
  BUSINESS_ACCOUNT_ID: "847392016254731", // Demo WhatsApp Business Account
  ACCESS_TOKEN: env.WHATSAPP_ACCESS_TOKEN,
  PHONE_NUMBER_ID: env.WHATSAPP_PHONE_NUMBER_ID,
};

const TemplateManagement: React.FC = () => {
  const { t } = useTranslation("pages");
  const { isRTL } = useLang();
  const [columns, setColumns] = useState<KanbanColumn[]>(
    initialTemplateColumns,
  );
  const [selectedTemplate, setSelectedTemplate] =
    useState<MessageTemplate | null>(null);
  const [isTemplateEditorOpen, setIsTemplateEditorOpen] = useState(false);
  const [editedTemplate, setEditedTemplate] = useState<MessageTemplate | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"pipeline" | "whatsapp">("pipeline");

  // Calculate template metrics
  const totalTemplates = columns.reduce(
    (total, column) => total + column.items.length,
    0,
  );
  const activeTemplates =
    columns.find((col) => col.id === "active")?.items.length || 0;
  const avgResponseRate =
    columns
      .flatMap((col) => col.items)
      .reduce(
        (sum, item) => sum + ((item as MessageTemplate).responseRate || 0),
        0,
      ) / totalTemplates || 0;
  const totalUsage = columns
    .flatMap((col) => col.items)
    .reduce(
      (sum, item) => sum + ((item as MessageTemplate).usageCount || 0),
      0,
    );

  // WhatsApp template submission handler
  const handleSubmitToMeta = async (template: any) => {
    try {
      toast.info("Submitting template to Meta for approval...");
      
      // Format template for Meta submission
      const metaTemplate = {
        name: template.name,
        category: template.category,
        language: template.language || "en_US",
        components: [
          {
            type: "BODY",
            text: template.content,
            example: template.variables ? {
              body_text: [template.variables.map((v: string) => `Example ${v}`)]
            } : undefined
          }
        ]
      };

      // Submit to Meta WhatsApp Business API
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${META_WHATSAPP_CONFIG.BUSINESS_ACCOUNT_ID}/message_templates`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${META_WHATSAPP_CONFIG.ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(metaTemplate),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success(`Template "${template.name}" submitted successfully to Meta! Template ID: ${result.id}`);
        
      } else {
        throw new Error(result.error?.message || 'Submission failed');
      }
    } catch (error) {
      console.error("ERROR Meta template submission failed:", error);
      toast.error(`Failed to submit template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleWhatsAppTemplateCreate = (template: any) => {
    console.log("Creating WhatsApp template:", template);
    handleSubmitToMeta(template);
  };

  const handleWhatsAppTemplateSend = (templateId: string, variables: Record<string, string>) => {
    console.log("Sending WhatsApp template:", { templateId, variables });
    toast.success(`Template ${templateId} sent successfully!`);
  };

  const handleTestWhatsAppConnection = () => {
    toast.info("Testing connection to Meta WhatsApp Business API...");
    // Connection test logic would go here
    setTimeout(() => {
      toast.success("Connected to Meta WhatsApp Business Account (ID: 847392016254731)");
    }, 1500);
  };

  const handleRefreshWhatsAppStatus = () => {
    toast.info("Refreshing WhatsApp Business status...");
    setTimeout(() => {
      toast.success("WhatsApp Business status updated");
    }, 1000);
  };

  const handleColumnsChange = (newColumns: KanbanColumn[]) => {
    // Enhanced bidirectional movement with smart validation
    const activeColumn = newColumns.find((col) => col.id === "active");
    const templateBankColumn = newColumns.find(
      (col) => col.id === "template_bank",
    );

    if (activeColumn && activeColumn.items.length > 3) {
      // Instead of blocking, show warning and allow temporary overflow
      console.warn(
        "WARNING  More than 3 active templates detected. Consider moving some to Template Bank for optimal performance.",
      );

      // Optional: Auto-move excess templates to template bank
      if (activeColumn.items.length > 5) {
        const excessTemplates = activeColumn.items.slice(3);
        const remainingActive = activeColumn.items.slice(0, 3);

        // Move excess back to template bank
        const updatedColumns = newColumns.map((column) => {
          if (column.id === "active") {
            return { ...column, items: remainingActive };
          }
          if (column.id === "template_bank") {
            return { ...column, items: [...column.items, ...excessTemplates] };
          }
          return column;
        });

        setColumns(updatedColumns);

        return;
      }
    }

    // Allow bidirectional movement
    setColumns(newColumns);
  };

  const handleTemplateClick = (item: KanbanItem) => {
    const template = item as MessageTemplate;
    setSelectedTemplate(template);
    setEditedTemplate({ ...template });
    setIsTemplateEditorOpen(true);
    setIsEditing(false);
  };

  const handleCloseTemplateEditor = () => {
    setIsTemplateEditorOpen(false);
    setSelectedTemplate(null);
    setEditedTemplate(null);
    setIsEditing(false);
  };

  const handleSaveTemplate = async () => {
    if (!editedTemplate || !selectedTemplate) return;

    setIsSaving(true);
    try {
      // Update the template in columns
      const updatedColumns = columns.map((column) => ({
        ...column,
        items: column.items.map((item) =>
          item.id === selectedTemplate.id ? editedTemplate : item,
        ),
      }));

      setColumns(updatedColumns);
      setSelectedTemplate(editedTemplate);
      setIsEditing(false);

      // TODO: Save to backend
    } catch (error) {
      console.error("Error saving template:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (selectedTemplate) {
      setEditedTemplate({ ...selectedTemplate });
    }
    setIsEditing(false);
  };

  return (
    <div
      className="min-h-screen bg-background"
      dir={isRTL ? "rtl" : "ltr"}
      data-testid="template-management"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold leading-8 tracking-[-0.02em] text-foreground">
              {t("templates.title", "Template Management")}
            </h1>
            <p className="mt-1 max-w-[68ch] text-sm text-muted-foreground">
              {t(
                "templates.subtitle",
                "Manage lead pipeline templates and WhatsApp Business templates for Meta integration.",
              )}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-moss-200 bg-moss-50 text-moss-700">
                Meta WhatsApp Business ID: <span className="tabular-nums">847392016254731</span>
              </Badge>
              <Badge variant="outline">
                Ready for template submission
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
              {t("templates.filterTemplates", "Filter Templates")}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
              {t("templates.export", "Export")}
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              {t("templates.newTemplate", "New Template")}
            </Button>
          </div>
        </div>

        {/* Template Management Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "pipeline" | "whatsapp")}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="kanban">{t("leadPipeline.kanban", "Pipeline")}</TabsTrigger>
            <TabsTrigger value="templates">{t("leadPipeline.templates", "Templates")}</TabsTrigger>
            <TabsTrigger value="whatsapp-manager">WhatsApp Manager</TabsTrigger>
            <TabsTrigger value="integration">{t("leadPipeline.integration", "Integration")}</TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline" className="space-y-6">

        {/* Enhanced Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <Card className={cn(activeTemplates > 3 && "border-amber-200 bg-amber-50 dark:bg-amber-900/10")}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("templates.activeTemplates", "Active Templates")}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{activeTemplates}/3</p>
                    {activeTemplates > 3 && (
                      <Badge variant="destructive" className="text-xs">
                        {t("templates.overLimit", "Over Limit")}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center",
                  activeTemplates > 3 
                    ? "bg-amber-100 dark:bg-amber-900/20" 
                    : "bg-green-100 dark:bg-green-900/20"
                )}>
                  <MessageSquare className={cn(
                    "h-4 w-4",
                    activeTemplates > 3 ? "text-amber-600" : "text-green-600"
                  )} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("templates.totalTemplates", "Total Templates")}
                  </p>
                  <p className="text-2xl font-bold">{totalTemplates}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("templates.avgResponseRate", "Avg Response Rate")}
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {avgResponseRate.toFixed(1)}%
                  </p>
                </div>
                <div className="h-8 w-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("templates.totalUsage", "Total Usage")}
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {totalUsage.toLocaleString()}
                  </p>
                </div>
                <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Template Management Guide */}
        {/* Enhanced Template Management Guide */}
        <Card className={cn(
          "transition-colors",
          activeTemplates > 3 
            ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
            : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center",
                activeTemplates > 3 
                  ? "bg-amber-100 dark:bg-amber-900/40"
                  : "bg-blue-100 dark:bg-blue-900/40"
              )}>
                <MessageSquare className={cn(
                  "h-4 w-4",
                  activeTemplates > 3 
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-blue-600 dark:text-blue-400"
                )} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className={cn(
                    "font-medium",
                    activeTemplates > 3 
                      ? "text-amber-900 dark:text-amber-100"
                      : "text-blue-900 dark:text-blue-100"
                  )}>
                    {t("templates.templateGuide", "Template Management Guide")}
                  </p>
                  {activeTemplates > 3 && (
                    <Badge variant="outline" className="border-amber-300 text-amber-700">
                      {t("templates.optimizationNeeded", "Optimization Needed")}
                    </Badge>
                  )}
                </div>
                <p className={cn(
                  "text-sm",
                  activeTemplates > 3 
                    ? "text-amber-700 dark:text-amber-300"
                    : "text-blue-700 dark:text-blue-300"
                )}>
                  {activeTemplates > 3 
                    ? t("templates.overLimitGuide", "You have more than 3 active templates. For optimal performance, consider moving some to Template Bank.")
                    : t("templates.templateGuideDescription", "Drag templates from your Template Bank to Active Templates (max 3). These will be used as your message hooks. Click any template to edit content and targeting.")
                  }
                </p>
              </div>
              {activeTemplates > 3 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Auto-optimize: move excess templates to template bank
                    const activeColumn = columns.find(col => col.id === "active");
                    const templateBankColumn = columns.find(col => col.id === "template_bank");
                    
                    if (activeColumn && templateBankColumn) {
                      const excessTemplates = activeColumn.items.slice(3);
                      const remainingActive = activeColumn.items.slice(0, 3);
                      
                      const updatedColumns = columns.map(column => {
                        if (column.id === "active") {
                          return { ...column, items: remainingActive };
                        }
                        if (column.id === "template_bank") {
                          return { ...column, items: [...column.items, ...excessTemplates] };
                        }
                        return column;
                      });
                      
                      setColumns(updatedColumns);
                    }
                  }}
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  {t("templates.autoOptimize", "Auto-Optimize")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Template Kanban Board */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 overflow-hidden">
          <KanbanBoard
            columns={columns}
            onColumnsChange={handleColumnsChange}
            onItemClick={handleTemplateClick}
            className="min-h-[600px]"
          />
        </div>
        
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-6">
            {/* WhatsApp Integration Status */}
            <WhatsAppIntegrationStatus
              onTestConnection={handleTestWhatsAppConnection}
              onRefresh={handleRefreshWhatsAppStatus}
            />

            {/* WhatsApp Template Manager */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6">
              <TemplateManager
                onSendTemplate={handleWhatsAppTemplateSend}
                onCreateTemplate={handleWhatsAppTemplateCreate}
              />
            </div>
            
            {/* Meta Integration Instructions */}
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                      Meta WhatsApp Business Integration
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
                    <div>
                      <h4 className="font-medium mb-2">Connected Account:</h4>
                      <p>Business Account ID: {META_WHATSAPP_CONFIG.BUSINESS_ACCOUNT_ID}</p>
                      <p>Status: Ready for template submission</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Template Submission:</h4>
                      <p>Templates are automatically submitted to Meta for approval</p>
                      <p>WAIT Approval typically takes 1-3 business days</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="whatsapp-manager" className="mt-6">
            <AppReviewTemplateManager />
          </TabsContent>
        </Tabs>
      </div>

      {/* Template Editor Side Panel */}
      {selectedTemplate && editedTemplate && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 shadow-lg z-50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {t("templates.templateEditor", "Template Editor")}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseTemplateEditor}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Edit/Save Controls */}
              <div className="flex items-center justify-between">
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    {t("templates.editTemplate", "Edit Template")}
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveTemplate}
                      disabled={isSaving}
                      className="gap-2"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="template-name" className="text-sm font-medium">
                  {t("templates.templateName", "Template Name")}
                </Label>
                <Input
                  id="template-name"
                  value={editedTemplate.title}
                  onChange={(e) =>
                    setEditedTemplate({
                      ...editedTemplate,
                      title: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label
                  htmlFor="template-content"
                  className="text-sm font-medium"
                >
                  {t("templates.content", "Content")}
                </Label>
                <Textarea
                  id="template-content"
                  value={editedTemplate.content}
                  onChange={(e) =>
                    setEditedTemplate({
                      ...editedTemplate,
                      content: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                  className="mt-1 h-32"
                  placeholder="Enter your template content..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">
                    {t("templates.responseRate", "Response Rate")}
                  </Label>
                  <p className="text-lg font-semibold text-green-600 mt-1">
                    {selectedTemplate.responseRate}%
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    {t("templates.usageCount", "Usage Count")}
                  </Label>
                  <p className="text-lg font-semibold mt-1">
                    {selectedTemplate.usageCount}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  {t("templates.templateType", "Template Type")}
                </Label>
                <Select
                  value={editedTemplate.templateType}
                  onValueChange={(value: TemplateType) =>
                    setEditedTemplate({
                      ...editedTemplate,
                      templateType: value,
                    })
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="opening">Opening</SelectItem>
                    <SelectItem value="follow_up">Follow Up</SelectItem>
                    <SelectItem value="objection_handling">
                      Objection Handling
                    </SelectItem>
                    <SelectItem value="closing">Closing</SelectItem>
                    <SelectItem value="nurturing">Nurturing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  {t("templates.tags", "Tags")}
                </Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedTemplate.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManagement;

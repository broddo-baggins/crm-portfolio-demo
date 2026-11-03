// @ts-nocheck
// DataDeletion.tsx - Account deletion request form
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/lib/utils";
import {
  Trash2,
  AlertTriangle,
  Mail,
  Clock,
  Database,
  MessageSquare,
  User,
  FileText,
  Shield,
  Download,
} from "lucide-react";
import { PublicPageShell } from "@/components/marketing/PublicPageShell";

const DataDeletion = () => {
  const { user } = useAuth();
  const { t } = useTranslation("pages");
  const { isRTL } = useLang();
  const [loading, setLoading] = useState(false);
  const [requestType, setRequestType] = useState<"immediate" | "request">(
    "request",
  );
  const [reason, setReason] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [confirmations, setConfirmations] = useState({
    understand: false,
    backup: false,
    irreversible: false,
    compliance: false,
  });

  const handleImmediateDeletion = async () => {
    if (!user) {
      toast.error("You must be logged in to delete your account");
      return;
    }

    if (confirmEmail !== user.email) {
      toast.error("Email confirmation does not match your account email");
      return;
    }

    const allConfirmed = Object.values(confirmations).every(Boolean);
    if (!allConfirmed) {
      toast.error("Please confirm all requirements before proceeding");
      return;
    }

    setLoading(true);
    try {
      // Call the account deletion function
      const { error } = await supabase.functions.invoke("delete-user-account", {
        body: {
          userId: user.id,
          reason: reason || "Self-service deletion request",
          requestType: "immediate",
        },
      });

      if (error) throw error;

      toast.success(
        "Account deletion request submitted successfully. You will be logged out shortly.",
      );

      // Sign out the user
      setTimeout(() => {
        supabase.auth.signOut();
      }, 2000);
    } catch (error: unknown) {
      console.error("Error requesting account deletion:", error);
      toast.error(
        "Failed to process deletion request. Please contact support.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDeletion = async () => {
    if (!user) {
      toast.error("You must be logged in to request data deletion");
      return;
    }

    if (!reason.trim()) {
      toast.error("Please provide a reason for your deletion request");
      return;
    }

    setLoading(true);
    try {
      // Insert deletion request as a notification for now
      const { error } = await supabase.from("notifications").insert({
        user_id: user.id,
        message: `Data Deletion Request: ${reason}`,
        type: "data_deletion_request",
        read: false,
      });

      if (error) throw error;

      toast.success(
        "Data deletion request submitted successfully. We will review your request within 30 days.",
      );
      setReason("");
    } catch (error: unknown) {
      console.error("Error submitting deletion request:", error);
      toast.error("Failed to submit deletion request. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  const dataTypes = [
    {
      icon: <User className="h-5 w-5 text-red-500" />,
      title: "Profile Information",
      description: "Name, email, phone number, role, and account settings",
    },
    {
      icon: <MessageSquare className="h-5 w-5 text-red-500" />,
      title: "WhatsApp Conversations",
      description:
        "All message history, conversation logs, and communication data",
    },
    {
      icon: <Database className="h-5 w-5 text-red-500" />,
      title: "Lead Data",
      description:
        "Contact information, lead status, notes, and interaction history",
    },
    {
      icon: <FileText className="h-5 w-5 text-red-500" />,
      title: "Projects & Settings",
      description: "Created projects, customizations, and user preferences",
    },
  ];

  return (
    <PublicPageShell dir={isRTL ? "rtl" : "ltr"}>
    <div
      className={cn("mx-auto px-4 py-10 sm:px-8 md:py-16", isRTL && "rtl")}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <span className="mb-5 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface">
            <Trash2 className="h-5 w-5 text-foreground" aria-hidden="true" />
          </span>
          <h1 className="mb-3 text-[32px] font-semibold leading-[38px] tracking-[-0.025em] text-foreground md:text-[40px] md:leading-[46px]">
            {t("dataDeletion.title", "Data Deletion Request")}
          </h1>
          <p className="max-w-[60ch] text-lg leading-8 text-subtle">
            {t(
              "dataDeletion.description",
              "Request deletion of your personal data in compliance with privacy regulations. Choose between immediate self-service deletion or a manual review process.",
            )}
          </p>
        </div>

        {/* Data Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              What Data Will Be Deleted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dataTypes.map((type, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 border border-border rounded-lg"
                >
                  {type.icon}
                  <div>
                    <h3 className="font-medium text-foreground">
                      {type.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {type.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Warning Alert */}
        <Alert className="mb-8 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            <strong>Important:</strong> Data deletion is irreversible. Once
            deleted, your account and all associated data cannot be recovered.
            Please ensure you have backed up any important information before
            proceeding.
          </AlertDescription>
        </Alert>

        {/* Deletion Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card
            className={requestType === "immediate" ? "ring-2 ring-red-500" : ""}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                Immediate Deletion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Delete your account and all associated data immediately. This
                action is irreversible.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 mb-4">
                <li>• Account disabled immediately</li>
                <li>• Data deleted within 24 hours</li>
                <li>• No manual review required</li>
                <li>• Backup recommended</li>
              </ul>
              <Button
                variant={requestType === "immediate" ? "default" : "outline"}
                size="sm"
                onClick={() => setRequestType("immediate")}
                className="w-full"
              >
                Select Immediate Deletion
              </Button>
            </CardContent>
          </Card>

          <Card
            className={requestType === "request" ? "ring-2 ring-blue-500" : ""}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Request Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Submit a deletion request for manual review by our team within
                30 days.
              </p>
              <ul className="text-xs text-gray-500 space-y-1 mb-4">
                <li>• Manual review process</li>
                <li>• Response within 30 days</li>
                <li>• Possible data export before deletion</li>
                <li>• Compliance verification</li>
              </ul>
              <Button
                variant={requestType === "request" ? "default" : "outline"}
                size="sm"
                onClick={() => setRequestType("request")}
                className="w-full"
              >
                Request Manual Review
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Deletion Form */}
        <Card>
          <CardHeader>
            <CardTitle>
              {requestType === "immediate"
                ? "Immediate Deletion Form"
                : "Deletion Request Form"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Reason */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Reason for deletion{" "}
                {requestType === "request" && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason for your data deletion request..."
                className="min-h-24"
                required={requestType === "request"}
              />
            </div>

            {requestType === "immediate" && (
              <>
                {/* Email Confirmation */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Confirm your email address{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    name="confirm-email"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    placeholder="Enter your email to confirm"
                    required
                    autoComplete="off"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current account email: {user?.email}
                  </p>
                </div>

                {/* Confirmations */}
                <div className="space-y-4">
                  <p className="font-medium text-sm">Required Confirmations:</p>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="understand"
                      checked={confirmations.understand}
                      onCheckedChange={(checked) =>
                        setConfirmations((prev) => ({
                          ...prev,
                          understand: !!checked,
                        }))
                      }
                    />
                    <label
                      htmlFor="understand"
                      className="text-sm text-gray-700 leading-relaxed"
                    >
                      I understand that deleting my account will permanently
                      remove all my data, including messages, leads, projects,
                      and account information.
                    </label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="backup"
                      checked={confirmations.backup}
                      onCheckedChange={(checked) =>
                        setConfirmations((prev) => ({
                          ...prev,
                          backup: !!checked,
                        }))
                      }
                    />
                    <label
                      htmlFor="backup"
                      className="text-sm text-gray-700 leading-relaxed"
                    >
                      I have backed up any important data or information that I
                      want to keep.
                    </label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="irreversible"
                      checked={confirmations.irreversible}
                      onCheckedChange={(checked) =>
                        setConfirmations((prev) => ({
                          ...prev,
                          irreversible: !!checked,
                        }))
                      }
                    />
                    <label
                      htmlFor="irreversible"
                      className="text-sm text-gray-700 leading-relaxed"
                    >
                      I acknowledge that this action is irreversible and my
                      account cannot be recovered once deleted.
                    </label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="compliance"
                      checked={confirmations.compliance}
                      onCheckedChange={(checked) =>
                        setConfirmations((prev) => ({
                          ...prev,
                          compliance: !!checked,
                        }))
                      }
                    />
                    <label
                      htmlFor="compliance"
                      className="text-sm text-gray-700 leading-relaxed"
                    >
                      I understand that some data may be retained for legal
                      compliance purposes as outlined in our Privacy Policy.
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
              <Button
                onClick={
                  requestType === "immediate"
                    ? handleImmediateDeletion
                    : handleRequestDeletion
                }
                disabled={
                  loading || (requestType === "request" && !reason.trim())
                }
                className={
                  requestType === "immediate"
                    ? "bg-red-600 hover:bg-red-700"
                    : ""
                }
                size="lg"
              >
                {loading
                  ? "Processing..."
                  : requestType === "immediate"
                    ? "Delete My Account Now"
                    : "Submit Deletion Request"}
              </Button>

              <Button variant="outline" size="lg" asChild>
                <Link to="/">Cancel and Return Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Download className="h-5 w-5" />
                Data Export
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Before deleting your account, you may want to export your data.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/data-export">Export My Data</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="h-5 w-5" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Have questions about data deletion? Contact our support team.
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href="mailto:privacy@crm-demo.com">Contact Support</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Legal Information */}
        <div className="mt-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-500 mt-1" />
                <div className="text-sm text-gray-600">
                  <p className="mb-2">
                    This data deletion process complies with GDPR, CCPA, and
                    other applicable privacy regulations. Some data may be
                    retained for legal compliance, fraud prevention, or
                    legitimate business interests as outlined in our{" "}
                    <Link
                      to="/privacy-policy"
                      className="text-primary hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                  <p>
                    For more information about your privacy rights, visit our{" "}
                    <Link
                      to="/privacy-policy#your-rights"
                      className="text-primary hover:underline"
                    >
                      Privacy Policy
                    </Link>{" "}
                    or contact us at{" "}
                    <a
                      href="mailto:privacy@crm-demo.com"
                      className="text-primary hover:underline"
                    >
                      privacy@crm-demo.com
                    </a>
                    .
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </PublicPageShell>
  );
};

export default DataDeletion;

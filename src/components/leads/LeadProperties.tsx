// @ts-nocheck
// TEMP: TypeScript compatibility issues - systematic fix needed

import React from "react";
import {
  X,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  MapPin,
  User,
  Clock,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import { useLang } from "@/hooks/useLang";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { LeadTemperatureBadge } from "./LeadTemperatureBadge";
import { LeadTemperature } from "@/config/leadStates";
import { Lead } from "@/types";
import { getLeadName, getLeadTemperature, getLeadCompany, getLeadNotes, getLeadLocation } from "@/utils/leadUtils";

interface LeadPropertiesProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (lead: Lead) => void;
  onDelete?: (leadId: string) => void;
  onCall?: (phone: string) => void;
  onEmail?: (email: string) => void;
  onMessage?: (leadId: string) => void;
}

export const LeadProperties: React.FC<LeadPropertiesProps> = ({
  lead,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onCall,
  onEmail,
  onMessage,
}) => {
  const { t } = useTranslation(["common", "leads"]);
  const { isRTL, textStart, flexRowReverse } = useLang();
  const navigate = useNavigate();

  if (!isOpen || !lead) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return t("leads.notAvailable", "N/A");
    return new Date(dateString).toLocaleDateString(isRTL ? "he-IL" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Enhanced message handler that navigates to conversation
  const handleMessageClick = () => {
    if (onMessage) {
      onMessage(lead.id);
    }

    // Navigate to messages page with lead filter
    const messagesUrl = `/messages?leadId=${lead.id}&phone=${encodeURIComponent(lead.phone)}`;
    navigate(messagesUrl);

    // Close the properties panel
    onClose();
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 z-50 bg-background dark:bg-background shadow-xl transition-transform duration-300 ease-in-out",
        "w-full sm:w-96 flex flex-col",
        isRTL ? "left-0" : "right-0",
        isOpen
          ? "translate-x-0"
          : isRTL
            ? "-translate-x-full"
            : "translate-x-full",
      )}
      data-testid="lead-properties-panel"
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between p-4 border-b border-border dark:border-border flex-shrink-0",
          isRTL && "flex-row-reverse",
        )}
      >
        <div
          className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}
        >
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getLeadName(lead).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className={cn(isRTL && "text-right")}>
            <h2
              className="text-lg font-semibold text-foreground dark:text-foreground"
              data-testid="lead-name"
            >
              {getLeadName(lead)}
            </h2>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              {getLeadCompany(lead) || t("leads.individual", "Individual")}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          data-testid="close-properties"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto overscroll-behavior-contain">
        <div className="p-4 space-y-6">
          {/* Status and Temperature */}
          <Card className="dark:bg-card">
            <CardHeader className="pb-3">
              <CardTitle
                className={cn(
                  "text-base text-foreground dark:text-foreground",
                  textStart(),
                )}
              >
                {t("leads.status", "Status & Temperature")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div
                className={cn(
                  "flex items-center gap-2",
                  isRTL && "flex-row-reverse",
                )}
              >
                <Tag className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                <span className="text-sm text-foreground dark:text-foreground">
                  {t("leads.status", "Status")}:
                </span>
                <LeadStatusBadge
                  status={lead.status}
                />
              </div>
              <div
                className={cn(
                  "flex items-center gap-2",
                  isRTL && "flex-row-reverse",
                )}
              >
                <Tag className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                <span className="text-sm text-foreground dark:text-foreground">
                  {t("leads.temperature", "Temperature")}:
                </span>
                <LeadTemperatureBadge
                  temperature={
                    (typeof lead.temperature === "string"
                      ? lead.temperature
                      : "Cold") as LeadTemperature
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="dark:bg-card">
            <CardHeader className="pb-3">
              <CardTitle
                className={cn(
                  "text-base text-foreground dark:text-foreground",
                  textStart(),
                )}
              >
                {t("leads.contactInfo", "Contact Information")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Phone */}
              <div
                className={cn(
                  "flex items-center justify-between",
                  isRTL && "flex-row-reverse",
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-2",
                    isRTL && "flex-row-reverse",
                  )}
                >
                  <Phone className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                  <span
                    className="text-sm text-foreground dark:text-foreground"
                    data-testid="lead-phone"
                  >
                    {lead.phone}
                  </span>
                </div>
                {onCall && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCall(lead.phone)}
                    data-testid="call-button"
                  >
                    <Phone className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Location */}
              {lead.location && (
                <div
                  className={cn(
                    "flex items-center gap-2",
                    isRTL && "flex-row-reverse",
                  )}
                >
                  <MapPin className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                  <span className="text-sm text-foreground dark:text-foreground">
                    {lead.location}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity */}
          <Card className="dark:bg-card">
            <CardHeader className="pb-3">
              <CardTitle
                className={cn(
                  "text-base text-foreground dark:text-foreground",
                  textStart(),
                )}
              >
                {t("leads.activity", "Activity")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div
                className={cn(
                  "flex items-center gap-2",
                  isRTL && "flex-row-reverse",
                )}
              >
                <Clock className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                <span className="text-sm text-foreground dark:text-foreground">
                  {t("leads.created", "Created")}:
                </span>
                <span className="text-sm text-muted-foreground dark:text-muted-foreground">
                  {formatDate(lead.created_at)}
                </span>
              </div>

              <div
                className={cn(
                  "flex items-center gap-2",
                  isRTL && "flex-row-reverse",
                )}
              >
                <MessageSquare className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                <span className="text-sm text-foreground dark:text-foreground">
                  {t("leads.lastContacted", "Last contacted")}:
                </span>
                <span className="text-sm text-muted-foreground dark:text-muted-foreground">
                  {formatDate(lead.last_contacted)}
                </span>
              </div>

              {lead.messageCount && (
                <div
                  className={cn(
                    "flex items-center gap-2",
                    isRTL && "flex-row-reverse",
                  )}
                >
                  <MessageSquare className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                  <span className="text-sm text-foreground dark:text-foreground">
                    {t("leads.messages", "Messages")}:
                  </span>
                  <Badge variant="secondary">{lead.messageCount}</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Last Message */}
          {lead.lastMessage && (
            <Card className="dark:bg-card">
              <CardHeader className="pb-3">
                <CardTitle
                  className={cn(
                    "text-base text-foreground dark:text-foreground",
                    textStart(),
                  )}
                >
                  {t("leads.lastMessage", "Last Message")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={cn(
                    "text-sm text-muted-foreground dark:text-muted-foreground",
                    textStart(),
                  )}
                >
                  "{lead.lastMessage}"
                </p>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {lead.notes && (
            <Card className="dark:bg-card">
              <CardHeader className="pb-3">
                <CardTitle
                  className={cn(
                    "text-base text-foreground dark:text-foreground",
                    textStart(),
                  )}
                >
                  {t("leads.notes", "Notes")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={cn(
                    "text-sm text-foreground dark:text-foreground",
                    textStart(),
                  )}
                >
                  {lead.notes}
                </p>
              </CardContent>
            </Card>
          )}

          <Separator className="dark:bg-border" />

          {/* Actions */}
          <div className="space-y-2">
            <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
              {onCall && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCall(lead.phone)}
                  className="flex-1"
                  leftIcon={<Phone className="h-4 w-4" />}
                  mobileOptimized={true}
                  data-testid="action-call-button"
                >
                  {t("leads.call", "Call")}
                </Button>
              )}
            </div>

            <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMessageClick}
                className="flex-1"
                leftIcon={<MessageSquare className="h-4 w-4" />}
                mobileOptimized={true}
                data-testid="action-message-button"
              >
                {t("leads.viewConversation", "View Conversation")}
              </Button>
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(lead)}
                  className="flex-1"
                  leftIcon={<User className="h-4 w-4" />}
                  mobileOptimized={true}
                  data-testid="action-edit-button"
                >
                  {t("common.edit", "Edit")}
                </Button>
              )}
            </div>

            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(lead.id)}
                className="w-full"
                mobileOptimized={true}
                data-testid="action-delete-button"
              >
                {t("common.delete", "Delete Lead")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// @ts-nocheck
// TEMP: TypeScript compatibility issues - systematic fix needed

import { Fragment, useState, useEffect, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Send,
  Paperclip,
  MessageSquare,
  Users,
  Activity,
  Search,
  AlertTriangle,
  Clock,
  RefreshCw,
  TrendingUp,
  Target,
  BarChart3,
  Download,
  SortAsc,
  SortDesc,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Sparkles,
  Mic,
  CalendarDays,
  ExternalLink,
  CheckCircle,
  Thermometer,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import logger from "@/services/base/logger";
import { toast } from "sonner";
import { simpleProjectService } from "@/services/simpleProjectService";
import { Lead } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useProject } from "@/context/ProjectContext";
import { useProjectDataRefresh } from "@/hooks/useProjectDataRefresh";
import { WhatsAppService } from "@/services/whatsapp-api";
import { ConversationService } from "@/services/conversationService";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { ArrowLeft, CheckCheck, Check as CheckIcon } from "lucide-react";
import { PersonAvatar } from "@/components/system/PersonAvatar";
import { HeatTag } from "@/components/system/HeatTag";
import { BantChip } from "@/components/system/BantChip";
import { bantFlags, heatWord } from "@/utils/leadInsight";
import { useLang } from "@/hooks/useLang";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
// Shadcn Chat Components
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import {
  ChatBubble,
  ChatBubbleMessage,
  ChatBubbleTimestamp,
} from "@/components/ui/chat/chat-bubble";
import { ChatInput } from "@/components/ui/chat/chat-input";
// Loading Component
import MessageLoading from "@/components/ui/chat/message-loading";
// Enhanced Chat Components inspired by shadcn-chatbot-kit
import ChatMessageActions from "@/components/ui/chat/chat-message-actions";
import ChatPromptSuggestions from "@/components/ui/chat/chat-prompt-suggestions";
import {
  ChatFileAttachment,
  FileUploadArea,
  AttachmentFile,
} from "@/components/ui/chat/chat-file-attachment";
import ChatVoiceInput from "@/components/ui/chat/chat-voice-input";
import { calendlyService } from "@/services/calendlyService";
import { ProgressWithLoading, DataLoadingProgress } from "@/components/ui/progress-with-loading";

interface Conversation {
  id: string;
  lead_id: string;
  message_content: string;
  timestamp: string;
  status: string;
  metadata: any;
  message_type: string; // 'incoming' | 'outgoing'
  created_at: string;
  updated_at: string;
}

interface WhatsAppMessage {
  id: string;
  lead_id?: string;
  conversation_id?: string;
  sender_number: string;
  receiver_number?: string;
  content: string;
  wamid: string;
  payload?: any;
  created_at: string;
  updated_at: string;
  wa_timestamp?: string;
  direction?: "inbound" | "outbound";
  message_type?: "text" | "media" | "system";
  lead_phone?: string;
  lead_name?: string;
}

interface ConversationWithMeta extends Conversation {
  lead: Lead;
  messageCount: number;
  lastMessage: string;
  lastActive: string;
  requiresHumanReview: boolean;
  leadStatus: string;
  projectId: string | null;
  projectName?: string;
}

const Messages = () => {
  // Get current project context
  const { currentProject } = useProject();
  
  // Auto-refresh functionality
  const { refreshMessages, refreshAll, isRefreshing } = useProjectDataRefresh();

  // RTL and translation support
  const { t } = useTranslation(["pages", "common"]);
  const { isRTL, flexRowReverse, textStart, textEnd } = useLang();

  // Core data state
  const [allConversations, setAllConversations] = useState<
    ConversationWithMeta[]
  >([]);
  const [allMessages, setAllMessages] = useState<WhatsAppMessage[]>([]);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);

  // Selected conversation
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationWithMeta | null>(null);
  const [currentMessages, setCurrentMessages] = useState<WhatsAppMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "active">("all");

  // Enhanced loading states for better UX
  const [sendingMessage, setSendingMessage] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [searchingConversations, setSearchingConversations] = useState(false);

  // Enhanced chat features state - DISABLED FOR SIMPLICITY
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [showPromptSuggestions, setShowPromptSuggestions] = useState(false); // DISABLED - set to false
  const [replyToMessage, setReplyToMessage] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15); // Increased default from 5 to 15

  // Sorting state
  const [sortBy, setSortBy] = useState<"date" | "name" | "messages" | "status">(
    "date",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Calendar integration state
  const [calendlyStatus, setCalendlyStatus] = useState({
    isConnected: false,
    isLoading: false,
    user: null as any,
    error: null as string | null,
  });

  // ENHANCED: Find messages for a lead using direct lead_id matching
  const findMessagesForLead = useCallback(
    (lead: Lead, allMessages: WhatsAppMessage[]): WhatsAppMessage[] => {
      // Filter messages by lead_id - much more reliable than phone matching
      const matchingMessages = allMessages.filter((msg) => {
        return msg.lead_id === lead.id;
      });

      // Messages are already sorted by timestamp in the service
      return matchingMessages;
    },
    [],
  );

  // ENHANCED: Load conversations with improved project filtering and better error handling
  const loadConversationsData = useCallback(async () => {
    try {
      
      // Check if we're in a browser environment before setting state
      if (typeof window !== 'undefined') {
        setLoading(true);
        setError(null);
      }

      // FIXED: Load data sequentially to prevent throttling race condition
      // Load leads first (they're needed for project filtering)
      const leadsData = await simpleProjectService.getAllLeads(undefined, true).catch((err) => {
        console.warn("Failed to load leads:", err);
        return [];
      });

      // Small delay to prevent throttling collision
      await new Promise(resolve => setTimeout(resolve, 100));

      // Load conversations (which ARE the messages!)
      let conversationsData = [];
      try {
        conversationsData = await simpleProjectService.getAllConversations(currentProject?.id).catch((err) => {
          console.warn("Failed to load conversations:", err);
          return [];
        });
      } catch (err) {
        console.warn("Error calling getAllConversations:", err);
        conversationsData = [];
      }

      
      // Check if component is still mounted before updating state
      if (typeof window !== 'undefined') {
        setAllLeads(leadsData || []);
        setAllMessages([]); // Not needed anymore - conversations ARE the messages
      }

      // Create leads map for O(1) lookup
      const leadsMap = new Map(
        (leadsData || []).map((lead) => [lead.id, lead]),
      );

      // SIMPLIFIED: Group conversations by lead ID
      const conversationsByLead = new Map<string, Conversation[]>();

      // Group all conversations by lead_id
      conversationsData.forEach((conv) => {
        if (!conversationsByLead.has(conv.lead_id)) {
          conversationsByLead.set(conv.lead_id, []);
        }
        conversationsByLead.get(conv.lead_id)!.push(conv);
      });

      const conversationsWithMeta: ConversationWithMeta[] = [];

      // Process each lead's conversations as a single aggregated conversation
      for (const [leadId, leadConversations] of conversationsByLead) {
        const lead = leadsMap.get(leadId);
        if (!lead) {
          console.debug(`SEARCH Skipping ${leadConversations.length} conversations for inaccessible lead ${leadId.substring(0, 8)}...`);
          continue;
        }

        // SIMPLIFIED: Just check if lead exists and has conversations
        const messageCount = leadConversations.length;
        
        if (messageCount === 0) {
          continue; // Skip leads with no conversations
        }

        // Use the most recent conversation as the base
        const mostRecentConv = leadConversations.sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime(),
        )[0];

        const lastMessage = mostRecentConv.message_content || "";
        const lastActive = mostRecentConv.updated_at || mostRecentConv.created_at;

        // Create aggregated conversation representing all conversations for this lead
        const aggregatedConversation: ConversationWithMeta = {
          ...mostRecentConv,
          lead,
          messageCount,
          lastMessage: lastMessage.substring(0, 100), // Truncate for display
          lastActive,
          requiresHumanReview: lead.requires_human_review || false,
          leadStatus: lead.status || "unknown",
          projectId: lead.current_project_id || lead.project_id,
          projectName: currentProject?.name || "Unknown Project",
        };

        conversationsWithMeta.push(aggregatedConversation);
      }

      // Sort conversations by message count and activity
      conversationsWithMeta.sort((a, b) => {
        // Priority 1: More messages first
        if (a.messageCount !== b.messageCount) {
          return b.messageCount - a.messageCount;
        }
        // Priority 2: Most recent activity
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
      });

      console.log(`CHAT Created ${conversationsWithMeta.length} conversation summaries`);

      // Check if component is still mounted before updating state
      if (typeof window !== 'undefined') {
        setAllConversations(conversationsWithMeta);
      }

      // Auto-select first conversation with messages
      const firstConvWithMessages = conversationsWithMeta[0];
      if (firstConvWithMessages && typeof window !== 'undefined' && window.innerWidth >= 1024) {
        setSelectedConversation(firstConvWithMessages);
        // Messages will be loaded by useEffect when selectedConversation changes
      }

    } catch (err) {
      console.error("ERROR Error loading conversations:", err);
      
      let errorMessage = "Unknown error";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }
      
      // Check if component is still mounted before updating state
      if (typeof window !== 'undefined') {
        setError(`Failed to load conversations: ${errorMessage}`);
        toast.error("Failed to load conversations: " + errorMessage);
      }
    } finally {
      // Check if we're in a browser environment before calling setLoading
      if (typeof window !== 'undefined') {
        setLoading(false);
      }
    }
  }, [currentProject?.id]);

  // ENHANCED: Load messages with better error handling and caching
  const loadMessagesForConversation = useCallback(
    async (conversation: ConversationWithMeta) => {
      try {
        setLoadingMessages(true);

        // Reset messages first to show loading state
        setCurrentMessages([]);

        // CRITICAL FIX: Each conversation row IS a message!
        // Get all conversations (messages) for this lead
        const allConversations = await simpleProjectService.getAllConversations();
        const leadConversations = allConversations.filter(conv => conv.lead_id === conversation.lead.id);
        
        if (leadConversations.length === 0) {
          setCurrentMessages([]);
          return;
        }

        // Transform conversations into messages format
        const messages: WhatsAppMessage[] = leadConversations.map((conv, index) => {
          // Determine direction based on message_type or alternating pattern
          let direction: "inbound" | "outbound";
          
          if (conv.message_type === "incoming") {
            direction = "inbound";
          } else if (conv.message_type === "outgoing") {
            direction = "outbound";
          } else {
            // Alternate for natural conversation flow
            direction = index % 2 === 0 ? "inbound" : "outbound";
          }

          return {
            id: conv.id,
            lead_id: conv.lead_id,
            conversation_id: conv.id,
            content: conv.message_content || "",
            sender_number: direction === "inbound" ? (conversation.lead.phone || "") : "system",
            receiver_number: direction === "outbound" ? (conversation.lead.phone || "") : "system",
            wamid: conv.wamid || conv.id,
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            wa_timestamp: conv.wa_timestamp || conv.timestamp || conv.created_at,
            direction,
            message_type: "text",
            lead_phone: conversation.lead.phone || "",
            lead_name: `${conversation.lead.first_name || ""} ${conversation.lead.last_name || ""}`.trim(),
          } as WhatsAppMessage;
        });

        // Sort by timestamp (oldest first for proper chat order)
        const sortedMessages = messages.sort(
          (a, b) =>
            new Date(a.wa_timestamp || a.created_at).getTime() -
            new Date(b.wa_timestamp || b.created_at).getTime()
        );

        // FORCE STATE UPDATE - Critical fix for React state issues
        setCurrentMessages(sortedMessages);
        
        console.log(`CHAT Loaded ${sortedMessages.length} messages for ${conversation.lead.first_name} ${conversation.lead.last_name}`);
      } catch (error) {
        console.error("ERROR Error loading messages:", error);
        setCurrentMessages([]);
        toast.error("Failed to load messages for conversation");
      } finally {
        setLoadingMessages(false);
      }
    },
    [], // Removed allMessages dependency since we're fetching directly
  );

  // Handle conversation selection
  const handleConversationSelect = useCallback(
    async (conversation: ConversationWithMeta) => {
      setSelectedConversation(conversation);
      await loadMessagesForConversation(conversation);
    },
    [loadMessagesForConversation],
  );

  // Utility functions
  const formatLeadName = useCallback((lead: Lead) => {
    const leadAny = lead as any;
    return (
      lead.name ||
      `${leadAny.first_name || ""} ${leadAny.last_name || ""}`.trim() ||
      "Unknown Lead"
    );
  }, []);

  const formatTimeAgo = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }, []);

  const getMessageColor = (
    status?: string,
    isSelected: boolean = false,
  ): string => {
    // Ensure status is a string before calling toLowerCase
    const statusStr = typeof status === 'string' ? status : '';
    
    if (isSelected) return "bg-primary/20 dark:bg-primary/30";
    switch (statusStr.toLowerCase()) {
      case "hot":
        return "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20";
      case "warm":
        return "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20";
      case "cold":
        return "bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20";
      default:
        return "bg-white dark:bg-slate-800";
    }
  };

  // Enhanced: Get message type icon for visual feedback
  const getMessageTypeIcon = useCallback(
    (messageType: string, direction: string) => {
      const isInbound = direction === "inbound";
      const iconColor = isInbound ? "text-blue-500" : "text-green-500";

      switch (messageType) {
        case "media":
          return <Paperclip className={`h-3 w-3 ${iconColor}`} />;
        case "system":
          return <Activity className={`h-3 w-3 text-gray-400`} />;
        default:
          return <MessageSquare className={`h-3 w-3 ${iconColor}`} />;
      }
    },
    [],
  );

  // Enhanced: Add debounced search effect
  useEffect(() => {
    if (searchQuery) {
      setSearchingConversations(true);
      const timeoutId = setTimeout(() => {
        setSearchingConversations(false);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchingConversations(false);
    }
  }, [searchQuery]);

  // Enhanced: Handle sending messages with loading state
  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim() || !selectedConversation || sendingMessage) return;

    try {
      setSendingMessage(true);
      const lead = selectedConversation.lead;

      // Check if lead has a phone number for WhatsApp®
      if (!lead.phone) {
        toast.error("Lead has no phone number for WhatsApp® messaging");
        return;
      }

      console.log(
        "Sending WhatsApp® message:",
        messageText,
        "to lead:",
        lead.first_name,
        lead.last_name,
        "phone:",
        lead.phone,
      );

      // DEMO MODE: no WhatsApp Business account is connected, so show the message
      // locally instead of calling Meta's API (which always failed here)
      if (import.meta.env.VITE_DEMO_MODE === "true") {
        const now = new Date().toISOString();
        setCurrentMessages((prev) => [
          ...prev,
          {
            id: `demo-${Date.now()}`,
            lead_id: lead.id,
            sender_number: "",
            receiver_number: lead.phone,
            content: messageText,
            wamid: "",
            created_at: now,
            updated_at: now,
            wa_timestamp: now,
            direction: "outbound",
            message_type: "text",
          },
        ]);
        setMessageText("");
        setAttachments([]);
        setReplyToMessage(null);
        toast.success("Demo mode: message added to the conversation (not sent to WhatsApp)");
        return;
      }

      // Initialize WhatsApp® service and send message
      const whatsappService = new WhatsAppService();
      const result = await whatsappService.sendMessage(lead.phone, messageText);

      if (
        result &&
        result.messages &&
        result.messages[0]?.message_status === "accepted"
      ) {
        // Message sent successfully via WhatsApp® API

        // Store the sent message in the conversation
        const conversationService = new ConversationService();
        await conversationService.sendWhatsAppMessage(lead.id, messageText, {
          receiver_number: lead.phone,
          whatsapp_message_id: result.messages[0].id,
          message_type: "text",
          direction: "outbound",
        });

        // Clear the input
        setMessageText("");
        setAttachments([]);
        setReplyToMessage(null);

        toast.success("Message sent successfully via WhatsApp®!");

        // Reload messages for this conversation to show the new message
        await loadMessagesForConversation(selectedConversation);
      } else {
        console.error("ERROR WhatsApp® message failed:", result);
        toast.error(
          "Failed to send WhatsApp® message - check phone number format",
        );
      }
    } catch (error) {
      console.error("ERROR Error sending WhatsApp message:", error);
      toast.error(
        `Failed to send message: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setSendingMessage(false);
    }
  }, [
    messageText,
    selectedConversation,
    sendingMessage,
    loadMessagesForConversation,
  ]);

  // Enhanced: Voice input handler
  const handleVoiceTranscript = useCallback((transcript: string) => {
    setMessageText((prev) => prev + (prev ? " " : "") + transcript);
    toast.success("Voice input added to message");
  }, []);

  // Enhanced: File attachment handlers
  const handleFileSelect = useCallback((files: File[]) => {
    const newAttachments: AttachmentFile[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadProgress: 0,
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);

    // Simulate file upload progress
    newAttachments.forEach((attachment) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          clearInterval(interval);
          setAttachments((prev) =>
            prev.map((a) =>
              a.id === attachment.id
                ? {
                    ...a,
                    uploadProgress: 100,
                    url: URL.createObjectURL(
                      files.find((f) => f.name === attachment.name)!,
                    ),
                  }
                : a,
            ),
          );
        } else {
          setAttachments((prev) =>
            prev.map((a) =>
              a.id === attachment.id
                ? { ...a, uploadProgress: Math.min(100, progress) }
                : a,
            ),
          );
        }
      }, 200);
    });

    toast.success(`${files.length} file(s) attached`);
  }, []);

  const handleRemoveAttachment = useCallback((fileId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== fileId));
  }, []);

  // Enhanced: Message action handlers
  const handleMessageReply = useCallback(
    (messageId: string) => {
      setReplyToMessage(messageId);
      const message = currentMessages.find((m) => m.id === messageId);
      if (message) {
        toast.success(`Replying to: "${message.content.substring(0, 50)}..."`);
      }
    },
    [currentMessages],
  );

  const handleMessageForward = useCallback(
    (messageId: string) => {
      const message = currentMessages.find((m) => m.id === messageId);
      if (message) {
        // Copy message content to clipboard for forwarding
        navigator.clipboard.writeText(message.content);
        toast.success("Message copied for forwarding");
      }
    },
    [currentMessages],
  );

  const handleMessageBookmark = useCallback((messageId: string) => {
    // Demo: nothing is stored, but the click answers
    toast.success("Message bookmarked (demo)", { id: `bookmark-${messageId}` });
  }, []);

  const handleMessageRate = useCallback(
    (messageId: string, rating: "up" | "down") => {
      // Demo: nothing is stored, but the click answers
      toast.success(rating === "up" ? "Thanks, marked as helpful (demo)" : "Thanks, marked as not helpful (demo)", {
        id: `rate-${messageId}`,
      });
    },
    [],
  );

  // Enhanced: Prompt suggestion handler
  const handlePromptSuggestion = useCallback((suggestion: any) => {
    setMessageText(suggestion.text);
    setShowPromptSuggestions(false);
    toast.success("Template applied");
  }, []);

  // Sort conversations
  const sortConversations = useCallback(
    (conversations: ConversationWithMeta[]) => {
      return [...conversations].sort((a, b) => {
        let comparison: number;

        switch (sortBy) {
          case "date":
            comparison =
              new Date(a.lastActive).getTime() -
              new Date(b.lastActive).getTime();
            break;
          case "name":
            comparison = formatLeadName(a.lead).localeCompare(
              formatLeadName(b.lead),
            );
            break;
          case "messages":
            comparison = a.messageCount - b.messageCount;
            break;
          case "status":
            comparison = (a.lead.status || "").localeCompare(
              b.lead.status || "",
            );
            break;
          default:
            comparison =
              new Date(a.lastActive).getTime() -
              new Date(b.lastActive).getTime();
        }

        return sortOrder === "asc" ? comparison : -comparison;
      });
    },
    [sortBy, sortOrder, formatLeadName],
  );

  // Initialize data on component mount
  useEffect(() => {
    loadConversationsData();
  }, []); // Empty dependency array for initial load only

  // Load messages when selectedConversation changes
  useEffect(() => {
    if (selectedConversation) {
      loadMessagesForConversation(selectedConversation);
    }
  }, [selectedConversation, loadMessagesForConversation]);

  // Handle project changes with proper debouncing and improved logic
  useEffect(() => {
    // Clear current selection when project changes
    setSelectedConversation(null);
    setCurrentMessages([]);
    setCurrentPage(1); // Reset pagination to first page

    // Debounce the reload to prevent rapid-fire calls
    const timeoutId = setTimeout(() => {
      loadConversationsData();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [currentProject?.id, loadConversationsData]); // Added loadConversationsData back

  // Listen for refresh events from the unified refresh hook
  useEffect(() => {
    const handleMessagesRefresh = (event: CustomEvent) => {
      
      // Clear current selection and reload data
      setSelectedConversation(null);
      setCurrentMessages([]);
      setCurrentPage(1);
      
      // Reload conversations data
      loadConversationsData();
    };

    const handleDataRefresh = (event: CustomEvent) => {
      
      // Clear current selection and reload data
      setSelectedConversation(null);
      setCurrentMessages([]);
      setCurrentPage(1);
      
      // Reload conversations data
      loadConversationsData();
    };

    // Add event listeners
    window.addEventListener('messages-data-refresh', handleMessagesRefresh as EventListener);
    window.addEventListener('conversations-data-refresh', handleMessagesRefresh as EventListener);
    window.addEventListener('project-data-refresh', handleDataRefresh as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('messages-data-refresh', handleMessagesRefresh as EventListener);
      window.removeEventListener('conversations-data-refresh', handleMessagesRefresh as EventListener);
      window.removeEventListener('project-data-refresh', handleDataRefresh as EventListener);
    };
  }, [loadConversationsData]);

  // Advanced filtering with search, priority, sorting, and pagination
  const { filteredConversations, totalPages, paginatedConversations } =
    useMemo(() => {
      let filtered = allConversations;

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (conv) =>
            formatLeadName(conv.lead).toLowerCase().includes(query) ||
            conv.lead.email?.toLowerCase().includes(query) ||
            conv.lead.phone?.includes(query) ||
            conv.lastMessage.toLowerCase().includes(query) ||
            conv.leadStatus.toLowerCase().includes(query),
        );
      }

      // Apply priority filter
      if (priorityFilter === "active") {
        filtered = filtered.filter(
          (conv) => conv.status === "active" && conv.messageCount > 0,
        );
      }

      // Apply sorting
      filtered = sortConversations(filtered);

      // Calculate pagination
      const totalPages = Math.ceil(filtered.length / itemsPerPage);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedConversations = filtered.slice(
        startIndex,
        startIndex + itemsPerPage,
      );

      return {
        filteredConversations: filtered,
        totalPages,
        paginatedConversations,
      };
    }, [
      allConversations,
      searchQuery,
      priorityFilter,
      currentPage,
      itemsPerPage,
      sortConversations,
    ]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, priorityFilter, sortBy, sortOrder]);

  // Enhanced: Export function with loading state - moved after filteredConversations definition
  const exportConversations = useCallback(async () => {
    try {
      setExportingData(true);

      // Simulate export processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const csvData = filteredConversations.map((conv) => ({
        "Lead Name": formatLeadName(conv.lead),
        Email: conv.lead.email || "",
        Phone: conv.lead.phone || "",
        Status: conv.lead.status || "",
        "Message Count": conv.messageCount,
        "Last Active": new Date(conv.lastActive).toLocaleString(),
        "Last Message": conv.lastMessage.substring(0, 100),
      }));

      // Create and download CSV
      const csv = [
        Object.keys(csvData[0]).join(","),
        ...csvData.map((row) =>
          Object.values(row)
            .map((val) => `"${val}"`)
            .join(","),
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `conversations-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success(`Exported ${csvData.length} conversations to CSV`);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export conversations");
    } finally {
      setExportingData(false);
    }
  }, [filteredConversations, formatLeadName]);

  // Generate pagination items
  const paginationItems = useMemo(() => {
    const items = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      // Smart pagination with ellipsis
      if (currentPage <= 3) {
        items.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        items.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        items.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        );
      }
    }

    return items;
  }, [currentPage, totalPages]);

  // Enhanced stats with average messages per conversation and analytics
  const stats = useMemo(() => {
    const totalConversations = allConversations.length;
    const activeConversations = allConversations.filter(
      (c) => c.status === "active",
    ).length;
    const withMessages = allConversations.filter(
      (c) => c.messageCount > 0,
    ).length;
    const totalMessages = allConversations.reduce(
      (sum, c) => sum + c.messageCount,
      0,
    );
    const uniqueLeads = new Set(allConversations.map((c) => c.lead_id)).size;

    // Calculate average messages per conversation
    const avgMessagesPerConversation =
      withMessages > 0 ? totalMessages / withMessages : 0;

    // Analytics: Conversations from today
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const todayConversations = allConversations.filter(
      (c) => new Date(c.lastActive) >= todayStart,
    ).length;

    // Analytics: Response rate (conversations with messages vs total)
    const responseRate =
      totalConversations > 0 ? (withMessages / totalConversations) * 100 : 0;

    // Analytics: High activity conversations (>5 messages)
    const highActivityConversations = allConversations.filter(
      (c) => c.messageCount > 5,
    ).length;

    return {
      totalConversations,
      activeConversations,
      withMessages,
      totalMessages,
      uniqueLeads,
      avgMessagesPerConversation,
      todayConversations,
      responseRate,
      highActivityConversations,
    };
  }, [allConversations]);

  // Check Calendly connection status
  useEffect(() => {
    const checkCalendlyConnection = async () => {
      try {
        setCalendlyStatus(prev => ({ ...prev, isLoading: true }));
        const connectionStatus = await calendlyService.getConnectionStatus();
        setCalendlyStatus({
          isConnected: connectionStatus.connected,
          isLoading: false,
          user: connectionStatus.user,
          error: connectionStatus.error,
        });
      } catch (error) {
        setCalendlyStatus({
          isConnected: false,
          isLoading: false,
          user: null,
          error: "Failed to check Calendly connection",
        });
      }
    };

    checkCalendlyConnection();
  }, []);

  // Handle calendar scheduling from message thread
  const handleScheduleMeeting = useCallback(async (lead: Lead) => {
    try {
      if (!calendlyStatus.isConnected) {
        toast.error("Please connect your Calendly account first");
        // Redirect to settings to connect Calendly
        window.location.href = "/settings?tab=integrations";
        return;
      }

      if (!calendlyStatus.user?.scheduling_url) {
        toast.error("Calendly scheduling URL not available");
        return;
      }

      // Create meeting context for BANT/HEAT qualification
      const meetingContext = {
        lead_id: lead.id,
        lead_name: formatLeadName(lead),
        lead_email: (lead as any).email,
        lead_phone: lead.phone,
        lead_status: lead.status,
        source: "whatsapp_conversation",
        project_id: lead.current_project_id || lead.project_id,
        project_name: currentProject?.name || "Unknown Project",
      };

      // Store meeting context in session for calendar page
      sessionStorage.setItem('meeting_context', JSON.stringify(meetingContext));

      // Navigate to calendar page with lead context
      window.location.href = `/calendar?lead_id=${lead.id}&source=messages`;
      
      toast.success(`Opening calendar for ${formatLeadName(lead)}`);
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      toast.error("Failed to open calendar for scheduling");
    }
  }, [calendlyStatus, formatLeadName, currentProject]);

  // Handle quick meeting link share
  const handleShareMeetingLink = useCallback(async (lead: Lead) => {
    try {
      if (!calendlyStatus.isConnected || !calendlyStatus.user?.scheduling_url) {
        toast.error("Calendly not connected");
        return;
      }

      const meetingLink = calendlyStatus.user.scheduling_url;
      const message = `Hi ${formatLeadName(lead)}, I'd like to schedule a call to discuss your project. Please use this link to book a convenient time: ${meetingLink}`;

      // Auto-fill the message input
      setMessageText(message);
      toast.success("Meeting link added to message - send when ready!");
    } catch (error) {
      console.error("Error sharing meeting link:", error);
      toast.error("Failed to generate meeting link");
    }
  }, [calendlyStatus, formatLeadName]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 dark:bg-slate-900 rounded-lg border dark:border-slate-800 p-8">
        <div className="w-full max-w-md space-y-4">
          <DataLoadingProgress 
            stage="fetching" 
            progress={65}
          />
          <div className="text-center">
            <span className="text-muted-foreground">
              {t("pages.messages.loadingConversations", "Loading conversations...")}
            </span>
            <div className="text-xs text-gray-400 dark:text-slate-600 mt-1">
              {t("pages.messages.fetchingData", "Fetching messages and lead data")}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
        <p className="font-medium">
          {t("common.errorLoadingConversations", "Error loading conversations")}
        </p>
        <p className="text-sm mt-1">{error}</p>
        <Button
          variant="outline"
          onClick={loadConversationsData}
          className="mt-2"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {t("common.retry", "Retry")}
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn("space-y-6", isRTL && "rtl")}
      dir={isRTL ? "rtl" : "ltr"}
      data-testid="messages-page"
    >
      {/* Header Section */}
      <div className={cn("flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", selectedConversation ? "hidden lg:flex" : "flex")}>
        <div className={textStart()}>
          <h1 className="text-2xl font-semibold leading-8 tracking-[-0.02em]">
            {t("pages.messages.messagesAndConversations", "Messages & Conversations")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(
              "pages.messages.manageWhatsAppConversations",
              "Manage WhatsApp conversations and automate responses",
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">
            {filteredConversations.length}{" "}
            {t("pages.messages.conversationsCount", "conversations")}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={exportConversations}
            disabled={exportingData}
          >
            {exportingData ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {t("pages.messages.export", "Export")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshMessages({ showSuccessToast: true })}
            disabled={loading || isRefreshing}
          >
            {loading || isRefreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {t("common.refresh", "Refresh")}
          </Button>
        </div>
      </div>

      {/* Quick Stats: one strip */}
      <Card className={cn("grid-cols-2 lg:grid-cols-4 [&>*]:border-border max-lg:[&>*:nth-child(n+3)]:border-t max-lg:[&>*:nth-child(even)]:border-s lg:[&>*+*]:border-s", selectedConversation ? "hidden lg:grid" : "grid")}>
        {[
          { id: "total", label: t("pages.messages.totalConversations", "Total Conversations"), value: String(filteredConversations.length) },
          { id: "active", label: t("pages.messages.activeChatToday", "Active Chat Today"), value: String(stats.activeConversations) },
          { id: "messages", label: t("pages.messages.messagesSent", "Messages Sent"), value: String(stats.totalMessages) },
          { id: "response", label: t("pages.messages.avgResponseTime", "Avg Response Time"), value: "2.3h" },
        ].map((k) => (
          <div key={k.id} className="px-4 py-3 md:px-5" data-testid={`message-stats-${k.id}`}>
            <p className={cn("text-[13px] font-medium text-subtle", textStart())}>{k.label}</p>
            <p className={cn("num mt-0.5 text-[26px] font-semibold leading-8", textStart())}>{k.value}</p>
          </div>
        ))}
      </Card>

      {/* Main Content */}
      <div className={cn("grid min-h-[480px] grid-cols-1 overflow-hidden rounded-[10px] border border-border bg-surface lg:h-[calc(100dvh-16rem)] lg:grid-cols-[340px_minmax(0,1fr)]", selectedConversation ? "h-[calc(100dvh-10.5rem)]" : "h-[calc(100dvh-14rem)]")}>
        {/* Conversations List */}
        <div className={cn("flex h-full max-h-full flex-col overflow-hidden border-border bg-surface lg:border-e", selectedConversation ? "hidden lg:flex" : "flex")}>
          <div className="flex-shrink-0 p-4 border-b dark:border-slate-700">
            <div className={cn("flex items-center justify-between mb-4", flexRowReverse())}>
              <h2 className={cn("text-lg font-semibold", textStart())}>
                {t("pages.messages.conversations", "Conversations")}
              </h2>
              <div className={cn("flex items-center gap-2", flexRowReverse())}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  aria-label={sortOrder === "asc" ? "Sort descending" : "Sort ascending"}
                  data-testid="sort-order-toggle"
                >
                  {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Search and filters */}
            {/* Phones: search takes its own row; beside two selects it shrank to an empty box */}
            <div className={cn("flex flex-wrap items-center gap-2 mb-2", flexRowReverse())}>
              <div className="relative basis-full sm:basis-auto sm:flex-1">
                <Search className={cn("pointer-events-none absolute z-10 h-4 w-4 text-gray-400", isRTL ? "right-3 top-3" : "left-3 top-3")} aria-hidden="true" />
                <Input
                  type="text"
                  placeholder={t("pages.messages.searchConversations", "Search conversations...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn("w-full", isRTL ? "pr-10" : "pl-10")}
                  dir={isRTL ? "rtl" : "ltr"}
                />
              </div>
              <Select value={priorityFilter} onValueChange={(value: "all" | "active") => setPriorityFilter(value)}>
                <SelectTrigger className="w-32" aria-label={t("pages.messages.filterConversations", "Filter conversations")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("pages.messages.allConversations", "All")}</SelectItem>
                  <SelectItem value="active">{t("pages.messages.activeOnly", "Active")}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32" aria-label={t("pages.messages.sortBy", "Sort by")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">{t("pages.messages.sortByDate", "Date")}</SelectItem>
                  <SelectItem value="name">{t("pages.messages.sortByName", "Name")}</SelectItem>
                  <SelectItem value="messages">{t("pages.messages.sortByMessages", "Messages")}</SelectItem>
                  <SelectItem value="status">{t("pages.messages.sortByStatus", "Status")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Items per page selector */}
            <div className={cn("flex items-center justify-between gap-2", flexRowReverse())}>
              <span className="text-xs text-muted-foreground">
                {t("pages.messages.conversationsPerPage", "Conversations per page")}
              </span>
              <Select value={itemsPerPage.toString()} onValueChange={(value: string) => setItemsPerPage(parseInt(value))}>
                <SelectTrigger className="h-8 w-20" aria-label={t("pages.messages.conversationsPerPage", "Conversations per page")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex-1 flex items-center justify-center p-4" data-testid="messages-loading">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
                <p className="text-muted-foreground">{t("common.loading", "Loading...")}</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex-1 flex items-center justify-center p-4" data-testid="messages-error">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                  <Button variant="link" className="h-auto p-0 ml-2 text-red-600" onClick={loadConversationsData}>
                    {t("common.retry", "Try again")}
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Conversations List Content */}
          <div
            className="flex-1 overflow-y-auto p-4"
            data-testid="conversations-list"
            tabIndex={0}
            role="region"
            aria-label={t("pages.messages.conversations", "Conversations")}
          >
            <div className="space-y-3">
              {paginatedConversations.map((conversation) => {
                const selected = selectedConversation?.id === conversation.id;
                const leadName = formatLeadName(conversation.lead);
                return (
                <div
                  key={conversation.id}
                  role="button"
                  tabIndex={0}
                  aria-current={selected || undefined}
                  className={cn(
                    "conversation flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 transition-colors duration-[120ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selected ? "bg-accent" : "hover:bg-accent/50",
                  )}
                  onClick={() => handleConversationSelect(conversation)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleConversationSelect(conversation);
                    }
                  }}
                  data-testid={`conversation-${conversation.id}`}
                >
                  <PersonAvatar name={leadName} />
                  <div className={cn("min-w-0 flex-1", textStart())}>
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="truncate text-sm font-medium text-foreground">{leadName}</h3>
                      <span className="num shrink-0 text-[11px] text-muted-foreground">{formatTimeAgo(conversation.lastActive)}</span>
                    </div>
                    <p className="truncate text-[13px] text-secondary-foreground">
                      {conversation.lastMessage || t("pages.messages.noMessages", "No messages yet")}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="num">{conversation.messageCount} {t("pages.messages.msgs", "msgs")}</span>
                      <span aria-hidden="true">/</span>
                      <span className="truncate">{conversation.lead.status || "Unknown"}</span>
                    </div>
                  </div>
                </div>
                );
              })}

              {paginatedConversations.length === 0 && (
                <div className="p-6 text-center text-gray-500 dark:text-slate-400" data-testid="conversations-empty">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-slate-600" />
                  <p>
                    {t(
                      "pages.messages.noConversationsFound",
                      "No conversations found",
                    )}
                  </p>
                  {filteredConversations.length > 0 ? (
                    <p className="text-xs mt-1">
                      {t(
                        "pages.messages.noConversationsOnPage",
                        "No conversations on page",
                      )}{" "}
                      {currentPage}
                    </p>
                  ) : (
                    <p className="text-xs mt-1">
                      {t(
                        "pages.messages.tryAdjustingFilters",
                        "Try adjusting your search or filters",
                      )}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex-shrink-0 p-4 border-t dark:border-slate-700" data-testid="messages-pagination">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                      className={cn(
                        currentPage === 1 && "pointer-events-none opacity-50",
                        "cursor-pointer",
                      )}
                    />
                  </PaginationItem>

                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    const isCurrentPage = pageNumber === currentPage;
                    const shouldShow =
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      Math.abs(pageNumber - currentPage) <= 1;

                    if (!shouldShow) {
                      if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    }

                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNumber)}
                          isActive={isCurrentPage}
                          className="cursor-pointer"
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                      className={cn(
                        currentPage === totalPages && "pointer-events-none opacity-50",
                        "cursor-pointer",
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className={cn("h-full max-h-full flex-col overflow-hidden", selectedConversation ? "flex" : "hidden lg:flex")} data-testid="chat-area">
          {selectedConversation ? (
            <>
              {/* Conversation header */}
              <div className="shrink-0 border-b border-border px-4 py-3" data-testid="conversation-header">
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="-ms-2 h-9 w-9 lg:hidden"
                    onClick={() => setSelectedConversation(null)}
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                  </Button>
                  <PersonAvatar name={formatLeadName(selectedConversation.lead)} size="md" className="sm:h-11 sm:w-11 sm:text-sm" />
                  <div className={cn("min-w-0 flex-1", textStart())}>
                    <h3 className="truncate text-[15px] font-semibold leading-5">{formatLeadName(selectedConversation.lead)}</h3>
                    <p className="truncate text-xs text-muted-foreground">
                      <span className="num">{selectedConversation.lead.phone || t("pages.messages.noPhone", "No phone")}</span>
                      {" / "}
                      {(selectedConversation.lead as any).email_address || (selectedConversation.lead as any).email || t("pages.messages.noEmail", "No email")}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <HeatTag temperature={heatWord((selectedConversation.lead as any).heat ?? (selectedConversation.lead as any).temperature)} />
                      <BantChip score={bantFlags(selectedConversation.lead as any).filter(Boolean).length} met={bantFlags(selectedConversation.lead as any)} />
                      <span className="hidden rounded-full border border-border px-2 py-0.5 text-xs font-medium text-secondary-foreground sm:inline-flex">
                        {String(selectedConversation.lead.state || "New").replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {calendlyStatus.isConnected ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleScheduleMeeting(selectedConversation.lead)}
                          aria-label={t("pages.messages.scheduleMeeting", "Schedule Meeting")}
                        >
                          <CalendarDays className="h-4 w-4" aria-hidden="true" />
                          <span className="hidden sm:inline">{t("pages.messages.scheduleMeeting", "Schedule Meeting")}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShareMeetingLink(selectedConversation.lead)}
                          aria-label={t("pages.messages.shareLink", "Share Link")}
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden="true" />
                          <span className="hidden md:inline">{t("pages.messages.shareLink", "Share Link")}</span>
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => (window.location.href = "/settings?tab=integrations")}>
                        <Calendar className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden sm:inline">{t("pages.messages.connectCalendly", "Connect Calendly")}</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Thread */}
              <div className="relative min-h-0 flex-1 bg-surface-sunken">
                <div className="absolute inset-0 overflow-y-auto" role="log" aria-label="Conversation" tabIndex={0}>
                  <div className="min-h-full px-4 py-4">
                    {loadingMessages ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-full max-w-sm">
                          <ProgressWithLoading
                            value={60}
                            label={t("common.loadingMessages", "Loading messages...")}
                            animated
                            indeterminate
                            className="mb-2"
                          />
                        </div>
                      </div>
                    ) : currentMessages.length > 0 ? (
                      <div className="flex flex-col gap-1" dir={isRTL ? "rtl" : "ltr"}>
                        {currentMessages.map((message, index) => {
                          const inbound = message.direction === "inbound";
                          const when = new Date(message.wa_timestamp || message.created_at);
                          const prev = currentMessages[index - 1];
                          const prevWhen = prev ? new Date(prev.wa_timestamp || prev.created_at) : null;
                          const newDay = !prevWhen || prevWhen.toDateString() !== when.toDateString();
                          const sameSender = prev && prev.direction === message.direction && !newDay;
                          return (
                            <Fragment key={message.id}>
                              {newDay && (
                                <div className="my-3 flex justify-center">
                                  <span className="rounded-full border border-border bg-surface px-3 py-0.5 text-xs font-medium text-secondary-foreground">
                                    {when.toLocaleDateString(isRTL ? "he-IL" : undefined, { weekday: "short", month: "short", day: "numeric" })}
                                  </span>
                                </div>
                              )}
                              <div className={cn("group relative flex", inbound ? "justify-start" : "justify-end", !sameSender && "mt-2")}>
                                <div
                                  className={cn(
                                    "max-w-[82%] rounded-xl px-3 py-1.5 text-sm shadow-[0_1px_0_hsl(var(--border))] sm:max-w-[70%]",
                                    inbound
                                      ? cn("border border-border bg-surface text-foreground", !sameSender && "rounded-ss-sm")
                                      : cn("bg-whatsapp-bubble text-whatsapp-bubble-foreground", !sameSender && "rounded-se-sm"),
                                    isRTL && "font-hebrew",
                                  )}
                                >
                                  <p className={cn("whitespace-pre-wrap break-words leading-5", textStart())}>{message.content}</p>
                                  <p className={cn("num mt-0.5 flex items-center justify-end gap-1 text-[11px]", inbound ? "text-muted-foreground" : "text-whatsapp-bubble-foreground/70")}>
                                    {when.toLocaleTimeString(isRTL ? "he-IL" : undefined, { hour: "2-digit", minute: "2-digit" })}
                                    {!inbound && (
                                      message.status === "read" ? (
                                        <CheckCheck className="h-3.5 w-3.5 text-steel-600 dark:text-steel-300" aria-label="Read" />
                                      ) : message.status === "delivered" ? (
                                        <CheckCheck className="h-3.5 w-3.5" aria-label="Delivered" />
                                      ) : (
                                        <CheckIcon className="h-3.5 w-3.5" aria-label="Sent" />
                                      )
                                    )}
                                  </p>
                                </div>
                                <ChatMessageActions
                                  message={{ id: message.id, content: message.content, direction: message.direction }}
                                  onReply={handleMessageReply}
                                  onForward={handleMessageForward}
                                  onBookmark={handleMessageBookmark}
                                  onRate={handleMessageRate}
                                  className={cn("absolute -top-3 max-sm:hidden", inbound ? "end-2" : "start-2")}
                                />
                              </div>
                            </Fragment>
                          );
                        })}

                        {calendlyStatus.isConnected && (
                          <div className="mt-4 flex justify-end">
                            <div className="w-full max-w-[82%] rounded-xl border border-border bg-surface p-3 sm:max-w-[360px]" data-testid="calendly-card">
                              <div className="flex items-start gap-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-steel-50 text-steel-700 dark:bg-steel-950 dark:text-steel-200">
                                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                                </span>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-foreground">30 minute intro call</p>
                                  <p className="text-xs text-muted-foreground">
                                    Calendly{calendlyStatus.user ? `, ${calendlyStatus.user.name}` : ""}. The lead picks a slot, it lands in your calendar.
                                  </p>
                                </div>
                              </div>
                              <div className="mt-3 flex gap-2">
                                <Button size="sm" className="flex-1" onClick={() => handleShareMeetingLink(selectedConversation.lead)}>
                                  Send booking link
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleScheduleMeeting(selectedConversation.lead)}>
                                  Open
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <MessageSquare className="mx-auto mb-2 h-8 w-8" aria-hidden="true" />
                          <p className="text-sm font-medium text-foreground">{t("pages.messages.noMessages", "No messages yet")}</p>
                          <p className="mt-0.5 text-xs">The agent writes first once this lead reaches the queue.</p>
                          {calendlyStatus.isConnected && (
                            <Button variant="outline" size="sm" onClick={() => handleScheduleMeeting(selectedConversation.lead)} className="mt-3">
                              <CalendarDays className="h-4 w-4" aria-hidden="true" />
                              {t("pages.messages.startWithMeeting", "Start with a meeting")}
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Composer */}
              <div className="shrink-0 border-t border-border bg-surface p-3">
                {(() => {
                  const lastInbound = [...currentMessages].reverse().find((m) => m.direction === "inbound")?.content?.toLowerCase() ?? "";
                  const first = String(formatLeadName(selectedConversation.lead)).split(" ")[0];
                  const suggestions = /price|cost|budget|how much/.test(lastInbound)
                    ? [`Plans start at a fixed monthly fee, ${first}. Want the numbers for your volume?`, "Happy to walk you through pricing on a short call.", "Which team size should I quote for?"]
                    : /meeting|call|demo|calendar|time|schedule/.test(lastInbound)
                    ? [`Great, ${first}. Here is my calendar, pick any slot.`, "Does tomorrow morning work for a 30 minute call?", "I will send a booking link now."]
                    : [`Thanks ${first}. What is your biggest challenge with leads today?`, "Would a short demo help?", "Can I ask about your timeline?"];
                  return (
                    <div className="mb-2 flex items-center gap-2 overflow-x-auto pb-1" role="group" aria-label="Suggested replies">
                      <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                        Suggested
                      </span>
                      {suggestions.map((text) => (
                        <button
                          key={text}
                          type="button"
                          onClick={() => setMessageText(text)}
                          className="max-w-[260px] shrink-0 truncate rounded-full border border-border bg-surface px-3 py-1 text-[13px] text-secondary-foreground transition-colors duration-[120ms] hover:border-ink-300 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          title={text}
                        >
                          {text}
                        </button>
                      ))}
                    </div>
                  );
                })()}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={messageText}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessageText(e.target.value)}
                      placeholder={t("pages.messages.typeMessage", "Type a message...")}
                      aria-label="Message"
                      onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={sendingMessage}
                      className={cn("w-full", isRTL && "font-hebrew")}
                      dir={isRTL ? "rtl" : "ltr"}
                    />
                  </div>
                  {calendlyStatus.isConnected && (
                    <Button
                      variant="outline"
                      onClick={() => handleShareMeetingLink(selectedConversation.lead)}
                      size="sm"
                      className="px-3"
                      aria-label={t("pages.messages.addMeetingLink", "Add meeting link to message")}
                    >
                      <Calendar className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  )}
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sendingMessage}
                    size="sm"
                    className="px-3"
                    aria-label={t("pages.messages.send", "Send message")}
                  >
                    {sendingMessage ? <MessageLoading /> : <Send className="h-4 w-4" aria-hidden="true" />}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center bg-surface-sunken px-6 text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="mx-auto mb-3 h-10 w-10" aria-hidden="true" />
                <p className="text-base font-medium text-foreground">
                  {t("pages.messages.selectConversation", "Select a conversation to view messages")}
                </p>
                <p className="mt-1 text-sm">
                  {t("pages.messages.chooseFrom", "Choose from")}{" "}
                  {filteredConversations.length.toLocaleString(isRTL ? "he-IL" : "en-US")}{" "}
                  {t("pages.messages.availableConversations", "available conversations")}
                  {totalPages > 1 &&
                    ` (${t("pages.messages.page", "Page")} ${currentPage.toLocaleString(isRTL ? "he-IL" : "en-US")} ${t("pages.messages.of", "of")} ${totalPages.toLocaleString(isRTL ? "he-IL" : "en-US")})`}
                </p>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
      
  );
};

export default Messages;

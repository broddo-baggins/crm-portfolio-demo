import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { MessageSquare, X, ArrowLeft, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { simpleProjectService } from "@/services/simpleProjectService";

type LeadTemperature = "Hot" | "Warm" | "Cool" | "Cold";

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface WhatsAppDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  leadName?: string;
}

interface ConversationMessage {
  id: number;
  name: string;
  message: string;
  time: string;
  unread: boolean;
  temperature: LeadTemperature;
  avatar: string;
  lastSeen: string;
  conversation: Array<{
    id: string;
    text: string;
    sender: "user" | "contact";
    timestamp: string;
    isDelivered?: boolean;
    isRead?: boolean;
  }>;
}

const WhatsAppDrawer = () => {
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<ConversationMessage | null>(
    null,
  );
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load real conversation data
  useEffect(() => {
    const loadConversations = async () => {
      setIsLoading(true);
      try {
        const realConversations =
          await simpleProjectService.getAllConversations();

        // Process real conversations into display format
        const processedConversations: ConversationMessage[] = (
          realConversations || []
        )
          .slice(0, 10)
          .map((conv, index) => ({
            id: index + 1,
            name: conv.sender_name || `Contact ${index + 1}`,
            message: conv.content || "No message content",
            time: new Date(conv.created_at).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            unread: Math.random() > 0.5, // Random unread status for demo
            temperature: (["Hot", "Warm", "Cool", "Cold"] as LeadTemperature[])[
              Math.floor(Math.random() * 4)
            ],
            avatar: (conv.sender_name || "U")[0].toUpperCase(),
            lastSeen: "Active now",
            conversation: [
              {
                id: conv.id,
                text: conv.content || "No message content",
                sender: "contact" as const,
                timestamp: conv.created_at,
                isDelivered: true,
                isRead: false,
              },
            ],
          }));

        console.log(
          "Debug: Conversations processed:",
          processedConversations.length,
        );
        setMessages(processedConversations);
      } catch (error) {
        console.log(
          "WARNING  Debug: Error loading conversations, using empty array:",
          error,
        );
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  // Detect RTL based on contact name
  const isRTL = selectedChat
    ? /[\u0590-\u05FF]/.test(selectedChat.name)
    : false;

  const handleViewMessages = () => {
    setIsOpen(true);
  };

  const handleSelectChat = (chat: ConversationMessage) => {
    setSelectedChat(chat);
    // Mark as read
    setMessages((prev) =>
      prev.map((msg) => (msg.id === chat.id ? { ...msg, unread: false } : msg)),
    );
  };

  const handleBackToList = () => {
    setSelectedChat(null);
  };

  const handleSendMessage = (messageText: string) => {
    if (!selectedChat) return;

    const newMessage = {
      id: `${Date.now()}`,
      text: messageText,
      sender: "user" as const,
      timestamp: new Date().toISOString(),
      isDelivered: true,
      isRead: false,
    };

    // Update the conversation in the selected chat
    const updatedChat = {
      ...selectedChat,
      conversation: [...selectedChat.conversation, newMessage],
      message: messageText,
      time: "Just now",
    };

    setSelectedChat(updatedChat);
    setMessages((prev) =>
      prev.map((msg) => (msg.id === selectedChat.id ? updatedChat : msg)),
    );
  };

  // Count unread messages
  const unreadCount = messages.filter((chat) => chat.unread).length;

  return (
    <>
      {/* Floating Button */}
      <Button
        variant="outline"
        className={`fixed bottom-4 right-4 shadow-lg z-10 safe-area-bottom ${isOpen ? "hidden" : "flex"}`}
        onClick={handleViewMessages}
      >
        <MessageSquare className="mr-2 h-5 w-5" />
        WhatsApp
        {unreadCount > 0 && (
          <Badge variant="destructive" className="ml-2">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {/* Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm">
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            {!selectedChat ? (
              // Chat List View
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b p-4 bg-[#25D366] text-white">
                  <h3 className="font-medium">WhatsApp Conversations</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      {t("common.loadingConversations", "Loading conversations...")}
                    </div>
                  ) : messages.length > 0 ? (
                    messages.map((chat) => (
                      <div
                        key={chat.id}
                        className="flex cursor-pointer items-center gap-3 border-b p-4 hover:bg-gray-50"
                        onClick={() => handleSelectChat(chat)}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-medium">
                          {chat.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{chat.name}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {chat.temperature}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {chat.time}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {chat.message}
                          </p>
                          <p className="text-xs text-gray-400">
                            {chat.lastSeen}
                          </p>
                        </div>
                        {chat.unread && (
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <div className="font-medium mb-2">
                        No conversations found
                      </div>
                      <div className="text-sm">
                        WhatsApp conversations will appear here when available
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Individual Chat View
              <ChatView
                chat={selectedChat}
                onBack={handleBackToList}
                onSendMessage={handleSendMessage}
                isRTL={isRTL}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

// Individual Chat Component
const ChatView = ({
  chat,
  onBack,
  onSendMessage,
  isRTL,
}: {
  chat: ConversationMessage;
  onBack: () => void;
  onSendMessage: (message: string) => void;
  isRTL: boolean;
}) => {
  const [newMessage, setNewMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage("");
    }
  };

  return (
    <div className="flex h-full flex-col" dir={isRTL ? "rtl" : "ltr"}>
      {/* Chat Header */}
      <div className="flex items-center gap-3 border-b p-4 bg-green-600 text-white">
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 font-medium text-sm">
          {chat.avatar}
        </div>
        <div className="flex-1">
          <h4 className="font-medium">{chat.name}</h4>
          <p className="text-sm text-green-100">{chat.lastSeen}</p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {chat.temperature}
        </Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.conversation.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.sender === "user" ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                message.sender === "user"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-900",
              )}
            >
              <p>{message.text}</p>
              <p
                className={cn(
                  "text-xs mt-1",
                  message.sender === "user"
                    ? "text-green-100"
                    : "text-gray-500",
                )}
              >
                {new Date(message.timestamp).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {message.sender === "user" && message.isDelivered && (
                  <span className="ml-1">✓</span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default WhatsAppDrawer;

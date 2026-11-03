import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Send, Paperclip, MessageSquare, AlertTriangle, Activity, Search, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useProject } from "@/context/ProjectContext";
import { toast } from "sonner";
import {
  useFilteredConversations,
  useOptimizedConversationMessages,
  useSendMessage,
  OptimizedConversation
} from "@/hooks/useOptimizedConversations";

const OptimizedMessages = () => {
  // Get current project context
  const { currentProject } = useProject();
  
  // UI state
  const [selectedConversation, setSelectedConversation] = useState<OptimizedConversation | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'human_review' | 'active'>('all');

  // Optimized data fetching with React Query
  const {
    conversations,
    isLoading: conversationsLoading,
    error: conversationsError,
    stats
  } = useFilteredConversations(searchQuery, priorityFilter);

  // Optimized messages fetching for selected conversation
  const {
    data: currentMessages = [],
    isLoading: messagesLoading,
    error: messagesError
  } = useOptimizedConversationMessages(selectedConversation);

  // Message sending mutation
  const sendMessageMutation = useSendMessage();

  // Auto-select first conversation when data loads
  React.useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      const firstPriorityConv = conversations.find(c => c.requiresHumanReview) || 
                               conversations.find(c => c.messageCount > 0) ||
                               conversations[0];
      
      if (firstPriorityConv) {
        setSelectedConversation(firstPriorityConv);
      }
    }
  }, [conversations, selectedConversation]);

  // Clear selection when project changes
  React.useEffect(() => {
    setSelectedConversation(null);
  }, [currentProject?.id]);

  // Handle conversation selection
  const handleConversationSelect = useCallback((conversation: OptimizedConversation) => {
    
    setSelectedConversation(conversation);
  }, []);

  // Utility functions
  const formatTimeAgo = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }, []);

  const getStatusColor = useCallback((status?: string) => {
    // Ensure status is a string before calling toLowerCase
    const statusStr = typeof status === 'string' ? status : '';
    
    switch (statusStr.toLowerCase()) {
      case "hot":
        return "bg-red-500";
      case "warm":
        return "bg-yellow-500";
      case "cold":
        return "bg-blue-500";
      default:
        return "bg-gray-400";
    }
  }, []);

  const getMessageTypeIcon = useCallback((messageType: string, direction: string) => {
    if (messageType === 'media') return direction === 'inbound' ? '📎' : '📤';
    if (messageType === 'system') return 'CONFIG';
    return direction === 'inbound' ? 'MOBILE' : '🤖';
  }, []);

  const handleSendMessage = useCallback(() => {
    if (messageText.trim() && selectedConversation) {
      sendMessageMutation.mutate({
        conversationId: selectedConversation.id,
        message: messageText.trim()
      }, {
        onSuccess: () => {
          toast.success("Message sent successfully!");
          setMessageText("");
        },
        onError: (error) => {
          toast.error("Failed to send message: " + error.message);
        }
      });
    }
  }, [messageText, selectedConversation, sendMessageMutation]);

  // Loading state
  if (conversationsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Loading optimized conversations...</span>
      </div>
    );
  }

  // Error state
  if (conversationsError) {
    return (
      <div className="p-4 text-center text-red-500 bg-red-50 border border-red-200 rounded-md">
        <p className="font-medium">Error loading conversations</p>
        <p className="text-sm mt-1">{conversationsError.message}</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="mt-2"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full h-full">
      {/* Header with stats */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Optimized Messages</h1>
          <div className="text-sm text-gray-500">
            Project: {currentProject?.name || 'All Projects'}
          </div>
        </div>
        
        {/* Performance Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
          <div className="bg-white p-3 rounded-md border">
            <div className="text-sm text-gray-500">Total</div>
            <div className="text-xl font-bold">{stats.totalConversations}</div>
          </div>
          <div className="bg-white p-3 rounded-md border">
            <div className="text-sm text-gray-500">Active</div>
            <div className="text-xl font-bold text-green-600">{stats.activeConversations}</div>
          </div>
          <div className="bg-white p-3 rounded-md border">
            <div className="text-sm text-gray-500">Review</div>
            <div className="text-xl font-bold text-orange-600">{stats.requiresReview}</div>
          </div>
          <div className="bg-white p-3 rounded-md border">
            <div className="text-sm text-gray-500">With Messages</div>
            <div className="text-xl font-bold text-blue-600">{stats.withMessages}</div>
          </div>
          <div className="bg-white p-3 rounded-md border">
            <div className="text-sm text-gray-500">Messages</div>
            <div className="text-xl font-bold">{stats.totalMessages}</div>
          </div>
          <div className="bg-white p-3 rounded-md border">
            <div className="text-sm text-gray-500">Filtered</div>
            <div className="text-xl font-bold">{stats.filteredCount}</div>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <Button
            variant={priorityFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPriorityFilter('all')}
            mobileOptimized={true}
          >
            All ({stats.totalConversations})
          </Button>
          <Button
            variant={priorityFilter === 'human_review' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPriorityFilter('human_review')}
            leftIcon={<AlertTriangle className="h-4 w-4" />}
            mobileOptimized={true}
          >
            Review ({stats.requiresReview})
          </Button>
          <Button
            variant={priorityFilter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPriorityFilter('active')}
            leftIcon={<Activity className="h-4 w-4" />}
            mobileOptimized={true}
          >
            Active ({stats.activeConversations})
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 h-[calc(100%-300px)]">
        {/* Conversation list */}
        <div className="md:col-span-1 border rounded-md overflow-hidden bg-white">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search conversations..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Showing {conversations.length} conversations
            </div>
          </div>
              
          <div className="overflow-y-auto h-[calc(100%-100px)]">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?.id === conversation.id ? "bg-blue-50 border-blue-200" : ""
                }`}
                onClick={() => handleConversationSelect(conversation)}
              >
                <div className="flex justify-between items-start">
                  <span className="font-medium">
                    {conversation.lead.name || 'Unknown Lead'}
                  </span>
                  <div className="flex items-center gap-1">
                    {conversation.requiresHumanReview && (
                      <AlertTriangle className="h-3 w-3 text-orange-500" />
                    )}
                    <div className={`h-2 w-2 rounded-full ${getStatusColor(conversation.leadStatus)}`}></div>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(conversation.lastActive)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {conversation.lastMessage?.substring(0, 60) || 'No message content'}...
                </p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-400">
                    {conversation.lead.email || conversation.lead.phone}
                  </p>
                  <div className="flex gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {conversation.leadStatus}
                    </Badge>
                    {conversation.messageCount > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {conversation.messageCount} msgs
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {conversations.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No conversations found</p>
                <p className="text-xs mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Message thread */}
        <div className="md:col-span-2 lg:col-span-3 border rounded-md overflow-hidden bg-white flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader className="p-4 border-b">
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <span>{selectedConversation.lead.name || 'Unknown Lead'}</span>
                    <div className={`h-3 w-3 rounded-full ml-2 ${getStatusColor(selectedConversation.leadStatus)}`}></div>
                    <Badge variant="outline" className="ml-2">
                      {selectedConversation.leadStatus || 'new'}
                    </Badge>
                    <Badge variant="default" className="ml-2">
                      {currentMessages.length} messages
                    </Badge>
                    {selectedConversation.requiresHumanReview && (
                      <Badge variant="destructive" className="ml-2">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Review Required
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm font-normal text-gray-500">
                    {selectedConversation.lead.email || selectedConversation.lead.phone}
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto p-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2 text-gray-500">Loading optimized messages...</span>
                  </div>
                ) : messagesError ? (
                  <div className="text-center text-red-500 py-8">
                    <p>Error loading messages: {messagesError.message}</p>
                  </div>
                ) : currentMessages.length > 0 ? (
                  <div className="space-y-4">
                    {currentMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.direction === 'inbound' ? 'justify-start' : 'justify-end'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.direction === 'inbound'
                              ? 'bg-gray-100 text-gray-900'
                              : 'bg-blue-500 text-white'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xs opacity-70">
                              {formatTimeAgo(message.wa_timestamp || message.created_at)}
                            </p>
                            <p className="text-xs opacity-60 ml-2">
                              {getMessageTypeIcon(message.message_type || 'text', message.direction)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No messages found for this conversation</p>
                    <p className="text-xs mt-1">
                      This might be due to phone number format differences
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Lead phone: {selectedConversation.lead.phone}
                    </p>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="p-4 border-t">
                <div className="flex space-x-2 w-full">
                  <Input
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    className="flex-1"
                    disabled={sendMessageMutation.isPending}
                  />
                  <Button size="icon" variant="outline">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sendMessageMutation.isPending}
                  >
                    {sendMessageMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardFooter>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a conversation to view messages</p>
                <p className="text-sm mt-1">Choose from {conversations.length} available conversations</p>
                {currentProject && (
                  <p className="text-xs text-gray-400 mt-2">
                    Filtered for project: {currentProject.name}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptimizedMessages; 
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Loader2, Bot, User, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { queryAgent, isGeminiAvailable, buildConversationContext } from '@/services/geminiService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Markdown parser utility
const parseMarkdown = (markdown: string): string => {
  if (!markdown) return '';

  // The result goes into dangerouslySetInnerHTML: escape raw HTML from the AI response
  // first, keeping only the <small> tag the assistant itself adds for the sources footer
  let html = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/&lt;(\/?)small&gt;/g, '<$1small>')

    // Headers
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mb-2 mt-4">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3 mt-4">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4 mt-4">$1</h1>')
    
    // Bold and italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="font-bold italic">$1</strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    
    // Code blocks (before inline code)
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-900 dark:bg-gray-950 text-gray-100 p-3 rounded-lg overflow-x-auto my-3 text-sm"><code>$2</code></pre>')
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-900 dark:bg-gray-950 text-gray-100 p-3 rounded-lg overflow-x-auto my-3 text-sm"><code>$1</code></pre>')
    
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-purple-600 dark:text-purple-400">$1</code>')
    
    // Lists (numbered and bullet)
    .replace(/^\d+\.\s+(.*$)/gm, '<li class="ml-6 mb-1">$1</li>')
    .replace(/^[*-]\s+(.*$)/gm, '<li class="ml-6 mb-1">$1</li>')
    
    // Links (http(s), mailto and same-site paths only, so no javascript: URLs)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) =>
      /^(https?:\/\/|mailto:|\/(?!\/))/i.test(url)
        ? `<a href="${url}" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">${text}</a>`
        : text)
    
    // Blockquotes
    .replace(/^&gt;\s+(.*$)/gm, '<blockquote class="border-l-4 border-gray-300 dark:border-gray-700 pl-4 italic my-2">$1</blockquote>')
    
    // Horizontal rules
    .replace(/^---$/gm, '<hr class="my-4 border-gray-300 dark:border-gray-700" />')
    
    // Line breaks - preserve double line breaks, convert single to <br>
    .replace(/\n\n/g, '</p><p class="mb-2">')
    .replace(/\n/g, '<br>');

  // Wrap consecutive list items in ul/ol tags
  html = html.replace(/(<li[^>]*>.*?<\/li>(?:\s*<li[^>]*>.*?<\/li>)*)/gs, '<ul class="list-disc space-y-1 my-2">$1</ul>');

  // Wrap in paragraph if not already wrapped
  if (!html.startsWith('<')) {
    html = '<p class="mb-2">' + html + '</p>';
  }

  return html;
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface GeminiAgentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuestion?: string;
  pageContext?: 'landing' | 'dashboard';
}

export const GeminiAgent: React.FC<GeminiAgentProps> = ({
  open,
  onOpenChange,
  initialQuestion,
  pageContext = 'dashboard'
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle initial question
  useEffect(() => {
    if (open && initialQuestion && messages.length === 0) {
      handleSend(initialQuestion);
    }
  }, [open, initialQuestion]);

  // Focus input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Simulate streaming effect for smoother UX
  const streamMessage = (fullContent: string, messageId: string) => {
    let currentIndex = 0;
    const words = fullContent.split(' ');
    
    // Clear any existing streaming interval
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
    }

    setStreamingMessageId(messageId);
    
    streamingIntervalRef.current = setInterval(() => {
      if (currentIndex < words.length) {
        const displayedContent = words.slice(0, currentIndex + 1).join(' ');
        
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, content: displayedContent, isStreaming: true }
              : msg
          )
        );
        
        currentIndex++;
      } else {
        // Streaming complete
        if (streamingIntervalRef.current) {
          clearInterval(streamingIntervalRef.current);
          streamingIntervalRef.current = null;
        }
        setStreamingMessageId(null);
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, isStreaming: false }
              : msg
          )
        );
      }
    }, 30); // Adjust speed here (30ms = ~33 words/second)
  };

  const handleSend = async (question?: string) => {
    const messageText = question || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation context
      const context = buildConversationContext(
        messages.map(m => ({ role: m.role, content: m.content }))
      );

      // Query the agent with page context
      const response = await queryAgent(messageText, context, pageContext);

      const assistantMessageId = `assistant-${Date.now()}`;
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '', // Start empty for streaming
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Start streaming the response
      streamMessage(response, assistantMessageId);
      
    } catch (error) {
      console.error('Failed to get response:', error);
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm having trouble responding right now. This could be because the Gemini API key isn't configured. I'm a demo assistant that helps explain this CRM system, its features, and architecture. Try asking me about BANT scoring, HEAT levels, or the tech stack!",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup streaming on unmount
  useEffect(() => {
    return () => {
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
      }
    };
  }, []);

  const handleCopy = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    'How does BANT qualification work?',
    'What is the HEAT scoring system?',
    'Tell me about the tech stack',
    'How was Supabase used?',
    'What is mock vs real data?',
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[600px] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-2">
                CRM Demo Assistant
                {!isGeminiAvailable() && (
                  <Badge variant="outline" className="text-xs">
                    Mock Mode
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                Ask me about features, architecture, BANT/HEAT methodology, or the tech stack
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 px-6" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="space-y-4 py-8">
                <div className="text-center space-y-2 mb-6">
                  <Bot className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="font-semibold">How can I help you today?</h3>
                  <p className="text-sm text-muted-foreground">
                    I can explain the CRM demo, its features, and technical architecture
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Try asking:</p>
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3 px-4"
                      onClick={() => handleSend(question)}
                    >
                      <Sparkles className="h-4 w-4 mr-2 flex-shrink-0 text-purple-500" />
                      <span className="text-sm">{question}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-3',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}

                    <div
                      className={cn(
                        'flex-1 max-w-[80%] space-y-2',
                        message.role === 'user' && 'flex justify-end'
                      )}
                    >
                      <div
                        className={cn(
                          'rounded-lg px-4 py-3',
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                      >
                        {message.role === 'user' ? (
                          <div className="whitespace-pre-wrap break-words text-sm">
                            {message.content}
                          </div>
                        ) : (
                          <div 
                            className="prose prose-sm max-w-none dark:prose-invert prose-headings:mt-2 prose-headings:mb-2 prose-p:my-1 prose-pre:my-2"
                            dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
                          />
                        )}
                        {message.isStreaming && (
                          <span className="inline-block w-2 h-4 bg-primary-foreground/50 ml-1 animate-pulse" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 px-1">
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                        {message.role === 'assistant' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleCopy(message.id, message.content)}
                          >
                            {copiedId === message.id ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 max-w-[80%]">
                      <div className="rounded-lg px-4 py-3 bg-muted">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                          <span className="text-sm text-muted-foreground">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about this CRM demo..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>

            {!isGeminiAvailable() && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Running in mock mode. Set GOOGLE_GENERATIVE_AI_API_KEY or GROQ_API_KEY on the server (/api/ai-assistant) for live responses.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GeminiAgent;


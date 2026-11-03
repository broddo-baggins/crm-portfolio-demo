import React from "react";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Reply,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Forward,
  Bookmark,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ChatMessageActionsProps {
  message: {
    id: string;
    content: string;
    direction?: "inbound" | "outbound";
  };
  onReply?: (messageId: string) => void;
  onForward?: (messageId: string) => void;
  onBookmark?: (messageId: string) => void;
  onRate?: (messageId: string, rating: "up" | "down") => void;
  className?: string;
}

export const ChatMessageActions: React.FC<ChatMessageActionsProps> = ({
  message,
  onReply,
  onForward,
  onBookmark,
  onRate,
  className,
}) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast.success("Message copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy message");
    }
  };

  const handleReply = () => {
    onReply?.(message.id);
  };

  const handleForward = () => {
    onForward?.(message.id);
  };

  const handleBookmark = () => {
    onBookmark?.(message.id);
    toast.success("Message bookmarked");
  };

  const handleRate = (rating: "up" | "down") => {
    onRate?.(message.id, rating);
    toast.success(
      `Message rated ${rating === "up" ? "positively" : "negatively"}`,
    );
  };

  return (
    <div
      className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${className}`}
    >
      {/* Quick Actions */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="h-7 w-7 p-0"
        aria-label="Copy message"
      >
        <Copy className="h-3 w-3" />
      </Button>

      {message.direction === "inbound" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReply}
          className="h-7 w-7 p-0"
          aria-label="Reply"
        >
          <Reply className="h-3 w-3" />
        </Button>
      )}

      {/* More Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" aria-label="More message actions">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleForward}>
            <Forward className="h-4 w-4 mr-2" />
            Forward Message
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleBookmark}>
            <Bookmark className="h-4 w-4 mr-2" />
            Bookmark
          </DropdownMenuItem>
          {message.direction === "inbound" && (
            <>
              <DropdownMenuItem onClick={() => handleRate("up")}>
                <ThumbsUp className="h-4 w-4 mr-2" />
                Rate Positive
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRate("down")}>
                <ThumbsDown className="h-4 w-4 mr-2" />
                Rate Negative
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ChatMessageActions;

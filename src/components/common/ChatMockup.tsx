import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TypingDots } from './TypingDots';
import { useTranslation } from 'react-i18next';
import { ConversationCycler } from '@/data/conversations/conversationCycler';
import chatBackground from '@/components/whatsapp/chatbackground.png';
import michalAvatar from '@/assets/images/avatars/michal-profile.jpg';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: string;
  requestedTime?: string; // For delayed message feature
}

export const ChatMockup: React.FC = () => {
  const { i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isTypingInInput, setIsTypingInInput] = useState(false);
  const [inputText, setInputText] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [currentConversation, setCurrentConversation] = useState<Array<{ text: string; sender: 'user' | 'agent' }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [conversationCompleted, setConversationCompleted] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const conversationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const processingStepRef = useRef<number>(-1);
  const finishTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isHebrew = i18n.language === 'he';

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      setTimeout(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  };

  // Debounced scroll to prevent excessive renders
  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages.length, isTyping]);

  // Cleanup function - memoized to prevent recreating
  const cleanup = useCallback(() => {
    if (conversationTimeoutRef.current) {
      clearTimeout(conversationTimeoutRef.current);
      conversationTimeoutRef.current = null;
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (finishTimerRef.current) {
      clearTimeout(finishTimerRef.current);
      finishTimerRef.current = null;
    }
    setIsTyping(false);
    setIsTypingInInput(false);
    setInputText('');
    setConversationCompleted(false);
    processingStepRef.current = -1;
  }, []);

  // Initialize and load conversation
  const loadNewConversation = useCallback(() => {
    try {
      cleanup();
      setMessages([]);
      setCurrentStep(0);
      setError(null);
      setConversationCompleted(false);
      
      const conversation = ConversationCycler.getRandomConversation(isHebrew);
      setCurrentConversation(conversation);
      
      // Removed console logging to reduce render triggers
    } catch (err) {
      setError('Failed to load conversation');
      console.error('Error loading conversation:', err);
    }
  }, [isHebrew, cleanup]);

  useEffect(() => {
    loadNewConversation();
    return cleanup;
  }, [loadNewConversation, cleanup]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Helper function to detect time-based delayed message requests
  const detectDelayedMessageRequest = (text: string) => {
    // Hebrew patterns for delayed responses
    const hebrewTimePatterns = [
      /בערב/,
      /ב[־\s]*(\d{1,2}):(\d{2})/,
      /אחר[י]?[\s]*הצהריים/,
      /בלילה/,
      /מחר/,
      /אחרי[\s]*ש/,
      /בסביבות[\s]*(\d{1,2}):(\d{2})/,
      /אחזור[\s]*אליך/,
      /אחזור[\s]*אלייך/,
      /קחו[\s]*את[\s]*הזמן/,
      /קחי[\s]*את[\s]*הזמן/,
      /זו[\s]*החלטה[\s]*חשובה/,
      /החלטה[\s]*משפחתית/,
      /לדבר[\s]*עם[\s]*בעלי/,
      /לדבר[\s]*עם[\s]*אשתי/,
      /נחזור[\s]*אליך/,
      /נחזור[\s]*אלייך/
    ];
    
    // English patterns for delayed responses  
    const englishTimePatterns = [
      /this evening/,
      /tonight/,
      /tomorrow/,
      /later/,
      /in the evening/,
      /after[\s]*(\d{1,2}):(\d{2})/,
      /around[\s]*(\d{1,2}):(\d{2})/,
      /at[\s]*(\d{1,2}):(\d{2})/,
      /reach[\s]*out[\s]*later/,
      /get[\s]*back[\s]*to[\s]*you/,
      /take[\s]*your[\s]*time/,
      /take[\s]*all[\s]*the[\s]*time/,
      /important[\s]*decision/,
      /family[\s]*decision/,
      /discuss[\s]*with[\s]*my[\s]*husband/,
      /discuss[\s]*with[\s]*my[\s]*wife/,
      /talk[\s]*to[\s]*my[\s]*husband/,
      /talk[\s]*to[\s]*my[\s]*wife/
    ];
    
    const patterns = isHebrew ? hebrewTimePatterns : englishTimePatterns;
    
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return true;
      }
    }
    return false;
  };

  // Enhanced function to detect if this is a follow-up after "take your time" message
  const detectFollowUpAfterDelay = (currentStep: number, conversation: Array<{ text: string; sender: 'user' | 'agent' }>) => {
    if (currentStep < 2) return false;
    
    // Look for the pattern: lead mentions consulting spouse/family -> agent says take your time -> agent follows up
    const twoStepsBack = conversation[currentStep - 2]?.text || '';
    const oneStepBack = conversation[currentStep - 1]?.text || '';
    // Note: currentMessage not used in this function, only checking previous messages
    
    // Hebrew patterns for "consult with spouse/family"
    const hebrewConsultPatterns = [
      /לדבר[\s]*עם[\s]*בעלי/,
      /לדבר[\s]*עם[\s]*אשתי/,
      /התייעצות[\s]*עם/,
      /החלטה[\s]*משפחתית/,
      /נחזור[\s]*אליך/,
      /נחזור[\s]*אלייך/
    ];
    
    // English patterns for "consult with spouse/family"  
    const englishConsultPatterns = [
      /discuss[\s]*with[\s]*my[\s]*husband/,
      /discuss[\s]*with[\s]*my[\s]*wife/,
      /talk[\s]*to[\s]*my[\s]*husband/,
      /talk[\s]*to[\s]*my[\s]*wife/,
      /family[\s]*decision/,
      /get[\s]*back[\s]*to[\s]*you/
    ];
    
    // Hebrew patterns for "take your time"
    const hebrewTakeTimePatterns = [
      /קחו[\s]*את[\s]*הזמן/,
      /קחי[\s]*את[\s]*הזמן/,
      /זו[\s]*החלטה[\s]*חשובה/,
      /החלטה[\s]*משפחתית[\s]*חשובה/
    ];
    
    // English patterns for "take your time"
    const englishTakeTimePatterns = [
      /take[\s]*your[\s]*time/,
      /take[\s]*all[\s]*the[\s]*time/,
      /important[\s]*decision/,
      /family[\s]*decision/
    ];
    
    const consultPatterns = isHebrew ? hebrewConsultPatterns : englishConsultPatterns;
    const takeTimePatterns = isHebrew ? hebrewTakeTimePatterns : englishTakeTimePatterns;
    
    // Check if lead mentioned consulting spouse/family 2 steps back
    const leadMentionedConsulting = consultPatterns.some(pattern => pattern.test(twoStepsBack));
    
    // Check if agent said "take your time" 1 step back
    const agentSaidTakeTime = takeTimePatterns.some(pattern => pattern.test(oneStepBack));
    
    return leadMentionedConsulting && agentSaidTakeTime;
  };

  // Generate requested/scheduled time based on message patterns
  const generateRequestedTime = (text: string, currentStep?: number, conversation?: Array<{ text: string; sender: 'user' | 'agent' }>) => {
    // Enhanced support for follow-up scenarios
    if (currentStep !== undefined && conversation && currentStep >= 2) {
      const twoStepsBack = conversation[currentStep - 2]?.text || '';
      const oneStepBack = conversation[currentStep - 1]?.text || '';
      
      // Check if this is a follow-up after delay scenario
      const isFollowUpAfterDelay = detectFollowUpAfterDelay(currentStep, conversation);
      
      if (isFollowUpAfterDelay) {
        console.log('🕐 Generating follow-up timestamp for delayed conversation scenario');
        
        // Generate a timestamp that's significantly later (hours or days)
        const now = new Date();
        const delayHours = Math.floor(Math.random() * 48) + 12; // 12-60 hours delay
        const scheduledTime = new Date(now.getTime() + (delayHours * 60 * 60 * 1000));
        
        return scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    }
    
    // Rest of the original function logic...
    // Check for time patterns in Hebrew
    const hebrewTimePatterns = [
      /בשעה[\s]*(\d{1,2}):(\d{2})/,  // "בשעה 14:30"
      /ב[\s]*(\d{1,2}):(\d{2})/,     // "ב 14:30"
      /(\d{1,2}):(\d{2})/            // "14:30"
    ];
    
    // Check for time patterns in English
    const englishTimePatterns = [
      /at[\s]*(\d{1,2}):(\d{2})/i,   // "at 2:30"
      /(\d{1,2}):(\d{2})\s*(am|pm)/i, // "2:30 PM"
      /(\d{1,2}):(\d{2})/            // "14:30"
    ];
    
    const timePatterns = isHebrew ? hebrewTimePatterns : englishTimePatterns;
    
    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) {
        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        
        // Handle AM/PM for English
        if (match[3]) {
          const ampm = match[3].toLowerCase();
          if (ampm === 'pm' && hours !== 12) hours += 12;
          if (ampm === 'am' && hours === 12) hours = 0;
        }
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
    }
    
    // If no specific time found, generate a reasonable follow-up time
    const now = new Date();
    const futureTime = new Date(now.getTime() + (Math.floor(Math.random() * 4 + 1) * 60 * 60 * 1000)); // 1-5 hours later
    return futureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Function to simulate typing in input box
  const typeMessageInInput = useCallback((text: string, callback: () => void) => {
    // Clear any existing typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    
    setIsTypingInInput(true);
    setInputText('');
    
    let currentIndex = 0;
    
    const typeNextCharacter = () => {
      if (currentIndex < text.length) {
        // Faster typing speed: 40-80ms per character (increased speed)
        const baseSpeed = 50;
        const variation = 50;
        const characterSpeed = baseSpeed + Math.random() * variation;
        
        // Add longer pauses for spaces (between words)
        const isSpace = text[currentIndex] === ' ';
        const pauseMultiplier = isSpace ? 1.5 : 1;
        
        // Slight pause for punctuation
        const isPunctuation = /[.,!?;:]/.test(text[currentIndex]);
        const punctuationPause = isPunctuation ? 1.2 : 1;
        
        setInputText(text.substring(0, currentIndex + 1));
        currentIndex++;
        
        typingTimeoutRef.current = setTimeout(typeNextCharacter, characterSpeed * pauseMultiplier * punctuationPause);
      } else {
        // Finished typing - shorter pause before "sending"
        typingTimeoutRef.current = setTimeout(() => {
          setInputText('');
          setIsTypingInInput(false);
          typingTimeoutRef.current = null;
          callback();
        }, 300 + Math.random() * 200); // 300-500ms pause before sending (faster)
      }
    };
    
    // Shorter initial delay before starting to type
    typingTimeoutRef.current = setTimeout(typeNextCharacter, 150 + Math.random() * 150);
  }, []);

  // Interactive send button handler with spam prevention
  const handleSendClick = useCallback(() => {
    console.log('🔴 Send button clicked!', { 
      currentStep, 
      conversationLength: currentConversation.length, 
      isTypingInInput,
      processingStep: processingStepRef.current 
    });
    
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime;
    
    // Spam prevention: minimum 500ms between clicks (reduced for better responsiveness)
    if (timeSinceLastClick < 500) {
      console.log('⏸️ Click blocked: too fast (spam prevention)');
      return;
    }
    
    setLastClickTime(now);
    
    
    // If conversation is finished, rotate to next one
    if (currentStep >= currentConversation.length || conversationCompleted) {
      
      loadNewConversation();
      return;
    }
    
    // Get the current message that should be displayed
    const currentMessage = currentConversation[currentStep];
    if (!currentMessage) {
      
      return;
    }
    
    // Check if this message is already displayed (to prevent duplicates)
    const isMessageAlreadyDisplayed = messages.some(msg => 
      msg.text === currentMessage.text && 
      msg.sender === currentMessage.sender &&
      Math.abs(messages.indexOf(msg) - currentStep) <= 1 // Allow some tolerance for step differences
    );
    
    if (isMessageAlreadyDisplayed) {
      console.log(`⏭️ Message already displayed, skipping to next step: "${currentMessage.text.substring(0, 50)}..."`);
      // Just advance to next step without displaying
      processingStepRef.current = -1;
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      // Check if this was the last message in the conversation
      if (nextStep >= currentConversation.length) {
        
        setConversationCompleted(true);
      }
      return;
    }
    
    console.log(`FAST User clicked send - immediately showing message: "${currentMessage.text.substring(0, 50)}..."`);
    
    // Clear any existing timeouts to prevent conflicts
    if (conversationTimeoutRef.current) {
      clearTimeout(conversationTimeoutRef.current);
      conversationTimeoutRef.current = null;
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    
    // Stop any current typing animations
    setIsTypingInInput(false);
    setIsTyping(false);
    setInputText('');
    
    // Immediately display the current message
    setMessages(prev => [...prev, {
      id: `${Date.now()}-${Math.random()}-${currentStep}`,
      text: currentMessage.text,
      sender: currentMessage.sender,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    
    // Reset processing step and advance to next step
    processingStepRef.current = -1;
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    
    // Check if this was the last message in the conversation
    if (nextStep >= currentConversation.length) {
      
      setConversationCompleted(true);
    }
    
  }, [lastClickTime, isTypingInInput, currentStep, currentConversation, conversationCompleted, messages, loadNewConversation]);

  // Check if conversation is finished and automatically rotate - ONLY after last message is displayed
  useEffect(() => {
    if (conversationCompleted) {
      
      // Wait 10 seconds after conversation is FULLY completed, then load new one
      finishTimerRef.current = setTimeout(() => {
        try {
          
          loadNewConversation();
        } catch (err) {
          setError('Failed to load new conversation');
          console.error('Error loading new conversation after finish:', err);
        }
      }, 10000);

      return () => {
        if (finishTimerRef.current) {
          clearTimeout(finishTimerRef.current);
          finishTimerRef.current = null;
        }
      };
    }
  }, [conversationCompleted, loadNewConversation]);

  // Handle conversation progression with proper delays and time simulation
  useEffect(() => {
    // Don't proceed if conversation is empty or we're past the end
    if (currentConversation.length === 0 || currentStep >= currentConversation.length) {
      console.log(`Conversation finished or invalid: length=${currentConversation.length}, step=${currentStep}`);
      return;
    }
    
    // Don't proceed if we're currently typing in input (prevents conflicts)
    if (isTypingInInput) {
      console.log('Waiting for input typing to finish before proceeding');
      return;
    }

    // Prevent processing the same step multiple times
    if (processingStepRef.current === currentStep) {
      console.log(`Step ${currentStep} is already being processed, skipping`);
      return;
    }
    
    // Mark this step as being processed
    processingStepRef.current = currentStep;

    const message = currentConversation[currentStep];
    
    // Check if this is a delayed response scenario
    const isDelayedScenario = currentStep > 0 && 
      detectDelayedMessageRequest(currentConversation[currentStep - 1].text);
    
    // Check if this is a follow-up after the agent told lead to "take their time"
    const isFollowUpAfterDelay = detectFollowUpAfterDelay(currentStep, currentConversation);
    
    // Enhanced debugging for delay scenarios
    if (isFollowUpAfterDelay) {
      console.log('🕐 DELAY SCENARIO DETECTED:');
      console.log(`   Step ${currentStep - 2}: "${currentConversation[currentStep - 2]?.text?.substring(0, 50)}..."`);
      console.log(`   Step ${currentStep - 1}: "${currentConversation[currentStep - 1]?.text?.substring(0, 50)}..."`);
      console.log(`   Step ${currentStep}: "${currentConversation[currentStep]?.text?.substring(0, 50)}..." (WILL BE DELAYED)`);
    }
    
    // Debug log to track progression
    console.log(`Processing step ${currentStep}/${currentConversation.length}: ${message.sender} - "${message.text.substring(0, 50)}..." ${isDelayedScenario ? '(DELAYED)' : ''} ${isFollowUpAfterDelay ? '(FOLLOW-UP)' : ''}`);

    // Agent messages: show typing, then message
    if (message.sender === 'agent') {
      // Add extra delay for simulated "delayed response" scenarios or follow-ups
      const extraDelay = (isDelayedScenario || isFollowUpAfterDelay) ? 8000 : 0; // 8 seconds extra for delayed responses
      
      if (extraDelay > 0) {
        
      }
      
      setIsTyping(true);
      
      conversationTimeoutRef.current = setTimeout(() => {
        // Check if conversation is still valid before proceeding
        if (currentConversation.length === 0 || currentStep >= currentConversation.length) {
          console.log('Conversation invalid during agent message, stopping');
          setIsTyping(false);
          processingStepRef.current = -1; // Reset processing step
          return;
        }
        
        setIsTyping(false);
        
        // Generate timestamp - enhanced for follow-up scenarios
        let timestamp: string;
        let requestedTime: string | undefined;
        
        if (isFollowUpAfterDelay) {
          // This is a FOLLOW-UP message after "take your time" - use delayed timestamp
          timestamp = generateRequestedTime(message.text, currentStep, currentConversation);
          requestedTime = timestamp; // Store for display
        } else if (isDelayedScenario && currentStep > 0) {
          // This is the SCHEDULED message (should use requested time)
          timestamp = generateRequestedTime(currentConversation[currentStep - 1].text);
          requestedTime = timestamp; // Store for display
        } else {
          // This is a REGULAR message (should use current time)
          timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        
        setMessages(prev => [...prev, {
          id: `${Date.now()}-${Math.random()}-${currentStep}`,
          text: message.text,
          sender: message.sender,
          timestamp,
          requestedTime
        }]);
        
        // Move to next step after message appears
        conversationTimeoutRef.current = setTimeout(() => {
          console.log(`Agent message complete, moving from step ${currentStep} to ${currentStep + 1}`);
          processingStepRef.current = -1; // Reset processing step
          const nextStep = currentStep + 1;
          setCurrentStep(nextStep);
          
          // Check if this was the last message in the conversation
          if (nextStep >= currentConversation.length) {
            
            setConversationCompleted(true);
          }
        }, 2000); // Reduced from 3000ms to 2000ms for faster flow
        
      }, 5000 + extraDelay); // Reduced from 6000ms to 5000ms for faster agent responses
    }
    // User messages: type in input first, then show as sent
    else {
      typeMessageInInput(message.text, () => {
        // Check if conversation is still valid before adding message
        if (currentConversation.length === 0 || currentStep >= currentConversation.length) {
          console.log('Conversation invalid during user message, stopping');
          processingStepRef.current = -1; // Reset processing step
          return;
        }
        
        setMessages(prev => [...prev, {
          id: `${Date.now()}-${Math.random()}-${currentStep}`,
          text: message.text,
          sender: message.sender,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        
        // Move to next step after message is sent
        conversationTimeoutRef.current = setTimeout(() => {
          console.log(`User message complete, moving from step ${currentStep} to ${currentStep + 1}`);
          processingStepRef.current = -1; // Reset processing step
          const nextStep = currentStep + 1;
          setCurrentStep(nextStep);
          
          // Check if this was the last message in the conversation
          if (nextStep >= currentConversation.length) {
            
            setConversationCompleted(true);
          }
        }, 1200); // Reduced from 1500ms to 1200ms for faster flow
      });
    }

    return () => {
      if (conversationTimeoutRef.current) {
        clearTimeout(conversationTimeoutRef.current);
        conversationTimeoutRef.current = null;
      }
      // Don't reset processingStepRef here as cleanup might run while step is still processing
    };
  }, [currentStep, currentConversation.length, isTypingInInput, typeMessageInInput]);

  // Reset animation and load new conversation every 105 seconds
  useEffect(() => {
    const resetTimer = setInterval(() => {
      try {
        loadNewConversation();
      } catch (err) {
        setError('Failed to reset conversation');
        console.error('Error resetting conversation:', err);
      }
    }, 105000);

    return () => clearInterval(resetTimer);
  }, [loadNewConversation]);

  // Helper function to check if we should show a date separator
  const shouldShowDateSeparator = (index: number) => {
    if (index === 0) return true; // Always show for first message
    
    const currentDate = new Date(messages[index].timestamp).toDateString();
    const previousDate = new Date(messages[index - 1].timestamp).toDateString();
    return currentDate !== previousDate;
  };

  // Function to format date separator
  const formatDateSeparator = (_timestamp: string) => {
    // Always return "Today" to prevent invalid date displays
    return isHebrew ? 'היום' : 'Today';
  };

  // Helper function to get display timestamp (use requestedTime if available)
  const getDisplayTimestamp = (message: Message) => {
    if (message.requestedTime) {
      return message.requestedTime;
    }
    return message.timestamp;
  };

  // Error boundary fallback
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-4 text-center text-red-500">
        <p>Something went wrong. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Chat Container - Reduced by 10% to prevent excessive scrolling */}
      <div className="bg-white rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.12)] overflow-hidden w-full max-w-[432px] mx-auto border border-gray-200 flex flex-col" style={{ height: '605px' /* 672px * 0.9 = 605px */ }}>
        {/* WhatsApp-style Header - Fixed for mobile alignment and centering */}
        {/* WhatsApp's own dark teal header: white on it is 7.6:1 (the bright #25D366 was 2.0:1) */}
        <div className="bg-[#075E54] text-white px-3 py-2 flex items-center justify-between relative min-h-[48px] font-chat flex-shrink-0">
          {/* Left side: Profile and info */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-1 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border-2 border-white/20 flex-shrink-0">
              <img 
                src={michalAvatar} 
                alt="Michal - Real Estate Agent"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-xs sm:text-sm leading-tight truncate">{isHebrew ? 'מיכל' : 'Michal'}</h3>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                <p className="text-xs text-white/90 leading-tight">{isHebrew ? 'פעיל עכשיו' : 'Active now'}</p>
              </div>
            </div>
          </div>
          
          {/* Right side: Live Now Badge */}
          <motion.div
            className="border border-white/40 text-white px-2 py-0.5 rounded-full text-[11px] font-medium flex-shrink-0 ms-2"
          >
            {isHebrew ? 'חי עכשיו' : 'LIVE NOW'}
          </motion.div>
        </div>

        {/* WhatsApp Chat Messages - Expanded to show more messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-2 min-h-0 safe-area-bottom" 
          dir={isHebrew ? 'rtl' : 'ltr'}
          style={{
            backgroundImage: `url(${chatBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <AnimatePresence>
            {messages.map((message, index) => (
              <React.Fragment key={message.id}>
                {/* Date Separator */}
                {shouldShowDateSeparator(index) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center my-2"
                  >
                    <div className="bg-black/10 px-3 py-1 rounded-full text-xs text-gray-600 font-medium">
                      {formatDateSeparator(message.timestamp)}
                    </div>
                  </motion.div>
                )}
                
                {/* Message */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-3 relative shadow-sm ${
                      message.sender === 'user'
                        ? 'bg-[#DCF8C6] text-gray-800' // Lead messages = Green
                        : 'bg-white text-gray-800' // Agent messages = White
                    }`}
                    style={{
                      borderRadius: '18px',
                      borderBottomRightRadius: message.sender === 'user' ? '4px' : '18px',
                      borderBottomLeftRadius: message.sender === 'agent' ? '4px' : '18px',
                    }}
                  >
                    <p 
                      className={`leading-[1.3] font-chat ${isHebrew ? 'whatsapp-text-hebrew' : 'whatsapp-text-english'}`}
                      dir={isHebrew ? 'rtl' : 'ltr'}
                      style={{ 
                        textAlign: isHebrew ? 'right' : 'left',
                        unicodeBidi: 'plaintext',
                        wordBreak: 'break-word',
                        fontSize: '14px', // Reduced proportionally for smaller container
                        lineHeight: '1.3'
                      }}
                    >
                      {message.text}
                    </p>
                    <div className={`flex justify-end mt-1 ${message.sender === 'user' ? 'items-center gap-1' : ''}`}>
                      <span className={`text-xs ${
                        message.sender === 'user' ? 'text-gray-600' : 'text-gray-500'
                      }`}
                      style={{ 
                        direction: 'ltr' // Timestamps always LTR
                      }}>
                        {getDisplayTimestamp(message)}
                      </span>
                      {/* WhatsApp checkmarks for sent messages */}
                      {message.sender === 'user' && (
                        <div className="flex">
                          <svg width="16" height="12" viewBox="0 0 16 12" className="text-gray-600">
                            <path fill="currentColor" d="M6.5 8.5L2 4l1.4-1.4L6.5 5.8l6.1-6.1L14 1.1l-7.5 7.4z"/>
                            <path fill="currentColor" d="M10.5 8.5L6 4l1.4-1.4L10.5 5.8l6.1-6.1L18 1.1l-7.5 7.4z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </React.Fragment>
            ))}
          </AnimatePresence>

          {/* WhatsApp Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex justify-start"
              >
                <div 
                  className="bg-white text-gray-800 shadow-sm px-4 py-3 relative"
                  style={{
                    borderRadius: '18px',
                    borderBottomLeftRadius: '4px'
                  }}
                >
                  <TypingDots />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* WhatsApp Input Area - Adaptive height container supporting up to 4 lines on mobile */}
        <div className="bg-[#F0F0F0] border-t border-gray-200 px-3 py-2.5 min-h-[56px] max-h-[120px] flex-shrink-0 safe-area-bottom flex items-end gap-3 flex-row-reverse">
          <div className="flex-1 relative">
            <div 
              className={`bg-white rounded-2xl px-3 py-2 min-h-[40px] flex items-center transition-all duration-200 ${
                inputText && inputText.length > 50 ? 'rounded-xl' : 'rounded-full'
              }`}
              style={{
                border: '1px solid #d1d5db',
                maxHeight: '80px' // 4 lines × 20px line height
              }}
            >
              <div 
                className={`flex-1 text-sm overflow-y-auto ${
                  inputText ? 'text-gray-800' : 'text-[#5E6975]'
                }`}
                style={{ 
                  direction: isHebrew ? 'rtl' : 'ltr',
                  textAlign: isHebrew ? 'right' : 'left',
                  minHeight: '20px',
                  maxHeight: '80px', // 4 lines × 20px line height
                  lineHeight: '20px',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {inputText || (isHebrew ? 'הקלד הודעה...' : 'Type a message...')}
                {/* Blinking caret when typing */}
                {isTypingInInput && inputText && (
                  <span 
                    className="animate-pulse text-gray-800 ml-0.5"
                    style={{
                      animation: 'blink 1s infinite',
                      display: 'inline-block'
                    }}
                  >
                    |
                  </span>
                )}
              </div>
            </div>
          </div>
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-150 bg-[#128C7E] hover:bg-[#0F7A6E] active:scale-90 active:bg-[#075E54]"
            onClick={handleSendClick}
          >
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              className="text-white"
            >
              <path 
                d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" 
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}; 
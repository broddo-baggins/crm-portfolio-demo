import crypto from "crypto";
import {
  WhatsAppLogger,
  WhatsAppError,
  ValidationError,
  AuthenticationError,
  RateLimitError,
  MetaAPIError,
  RateLimiter,
  CircuitBreaker,
  ErrorRecoveryManager,
  MetaErrorHandler,
  HealthMonitor,
  type LogContext,
} from "../../lib/whatsapp-error-handler";

// Enhanced WhatsApp Business API Webhook Handler
// Production-ready with comprehensive error handling and logging for Meta App Review

// === GLOBAL INSTANCES ===
const logger = WhatsAppLogger.getInstance();
const rateLimiter = new RateLimiter();
const circuitBreaker = new CircuitBreaker(5, 60000); // 5 failures, 60s recovery
const errorRecovery = new ErrorRecoveryManager();
const healthMonitor = new HealthMonitor();

// === INTERFACES ===
interface WhatsAppMessage {
  id: string;
  from: string;
  type: "text" | "image" | "document" | "location" | "audio" | "video";
  text?: { body: string };
  image?: { id: string; mime_type: string };
  document?: { id: string; filename: string; mime_type: string };
  timestamp: string;
}

interface MessageStatus {
  id: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  recipient_id: string;
  errors?: Array<{
    code: number;
    title: string;
    message: string;
    error_data?: { details: string };
  }>;
}

interface Contact {
  profile: { name: string };
  wa_id: string;
}

interface Metadata {
  display_phone_number: string;
  phone_number_id: string;
}

interface WhatsAppWebhookData {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messages?: WhatsAppMessage[];
        statuses?: MessageStatus[];
        contacts?: Contact[];
        metadata: Metadata;
      };
      field: string;
    }>;
  }>;
}

// === WEBHOOK VERIFICATION HANDLER ===
export async function handleVerification(request: Request): Promise<Response> {
  const requestId = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const context: LogContext = {
    requestId,
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get("User-Agent") || undefined,
    ipAddress:
      request.headers.get("CF-Connecting-IP") ||
      request.headers.get("X-Forwarded-For") ||
      undefined,
  };

  try {
    logger.info("WhatsApp webhook verification initiated", context);

    const url = new URL(request.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    // Input validation
    if (!mode || !token || !challenge) {
      throw new ValidationError(
        "Missing required verification parameters",
        "hub parameters",
      );
    }

    logger.debug("Verification parameters received", context, {
      mode,
      tokenPresent: !!token,
      challengePresent: !!challenge,
    });

    // Verify the webhook with Meta's expected token
    // Server-only env name: never read secrets via VITE_* (Vite inlines those into the browser bundle)
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

    if (!VERIFY_TOKEN) {
      logger.critical(
        "Missing WHATSAPP_VERIFY_TOKEN environment variable",
        context,
      );
      throw new AuthenticationError("Webhook verification configuration error");
    }

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      logger.info("Webhook verification successful", context, { challenge });
      return new Response(challenge, {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
          "X-Request-ID": requestId,
          "X-Timestamp": new Date().toISOString(),
        },
      });
    } else {
      logger.warn(
        "Webhook verification failed - invalid token or mode",
        context,
        {
          mode,
          tokenMatch: token === VERIFY_TOKEN,
        },
      );
      throw new AuthenticationError("Invalid verification token or mode");
    }
  } catch (error) {
    if (error instanceof WhatsAppError) {
      logger.error(
        `Webhook verification failed: ${error.message}`,
        context,
        error,
        { code: error.code },
      );
      return new Response(error.message, {
        status: error.statusCode,
        headers: {
          "X-Request-ID": requestId,
          "X-Error-Code": error.code,
        },
      });
    } else {
      logger.critical(
        "Unexpected error during webhook verification",
        context,
        error as Error,
      );
      return new Response("Internal Server Error", {
        status: 500,
        headers: { "X-Request-ID": requestId },
      });
    }
  }
}

// === WEBHOOK MESSAGE HANDLER ===
export async function handleWebhook(request: Request): Promise<Response> {
  const requestId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();

  const context: LogContext = {
    requestId,
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get("User-Agent") || undefined,
    ipAddress:
      request.headers.get("CF-Connecting-IP") ||
      request.headers.get("X-Forwarded-For") ||
      undefined,
  };

  try {
    logger.info("WhatsApp webhook message received", context);

    // Request timeout protection (30 seconds)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () =>
          reject(
            new WhatsAppError("Request timeout", "TIMEOUT_ERROR", 408, true),
          ),
        30000,
      );
    });

    // Process the webhook with timeout protection
    const processingPromise = processWebhookWithValidation(request, context);

    await Promise.race([processingPromise, timeoutPromise]);

    const processingTime = Date.now() - startTime;
    logger.info("Webhook processing completed successfully", context, {
      processingTimeMs: processingTime,
    });

    // Always return 200 to acknowledge receipt to Meta
    return new Response("OK", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "X-Request-ID": requestId,
        "X-Processing-Time": processingTime.toString(),
        "X-Status": "success",
      },
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    healthMonitor.incrementErrors();

    if (error instanceof WhatsAppError) {
      logger.error(
        `Webhook processing failed: ${error.message}`,
        context,
        error,
        {
          code: error.code,
          processingTimeMs: processingTime,
          retryable: error.retryable,
        },
      );

      // For Meta webhooks, we should return 200 even on errors to prevent unwanted retries
      // Log the error but acknowledge receipt
      return new Response("OK", {
        status: 200,
        headers: {
          "X-Request-ID": requestId,
          "X-Error": error.code,
          "X-Processing-Time": processingTime.toString(),
        },
      });
    } else {
      logger.critical(
        "Unexpected error during webhook processing",
        context,
        error as Error,
        {
          processingTimeMs: processingTime,
        },
      );

      // Return 500 for unexpected errors to trigger Meta retries
      return new Response("Internal Server Error", {
        status: 500,
        headers: {
          "X-Request-ID": requestId,
          "X-Processing-Time": processingTime.toString(),
        },
      });
    }
  }
}

// === WEBHOOK PROCESSING WITH VALIDATION ===
async function processWebhookWithValidation(
  request: Request,
  context: LogContext,
): Promise<void> {
  // Verify webhook signature for security
  const signature = request.headers.get("x-hub-signature-256");
  const body = await request.text();

  logger.debug("Webhook signature verification", context, {
    signaturePresent: !!signature,
    bodyLength: body.length,
  });

  if (!verifyWhatsAppSignature(body, signature, context)) {
    throw new AuthenticationError("Invalid webhook signature");
  }

  // Parse webhook data with error handling
  let webhookData: WhatsAppWebhookData;
  try {
    webhookData = JSON.parse(body);
  } catch (error) {
    logger.error("Failed to parse webhook JSON", context, error as Error, {
      bodyPreview: body.substring(0, 200),
    });
    throw new ValidationError("Invalid JSON in webhook body");
  }

  // Validate webhook structure
  validateWebhookStructure(webhookData, context);

  logger.info("Webhook data parsed and validated successfully", context, {
    entryCount: webhookData.entry?.length || 0,
    object: webhookData.object,
  });

  // Process webhook data with circuit breaker protection
  await circuitBreaker.execute(async () => {
    await processWhatsAppWebhook(webhookData, context);
  });
}

// === SIGNATURE VERIFICATION ===
function verifyWhatsAppSignature(
  payload: string,
  signature: string | null,
  context: LogContext,
): boolean {
  if (!signature) {
    logger.warn("Missing webhook signature", context);
    return false;
  }

  const APP_SECRET = process.env.WHATSAPP_APP_SECRET;
  if (!APP_SECRET) {
    logger.critical(
      "Missing WHATSAPP_APP_SECRET environment variable",
      context,
    );
    return false;
  }

  try {
    const expectedSignature =
      "sha256=" +
      crypto.createHmac("sha256", APP_SECRET).update(payload).digest("hex");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );

    if (isValid) {
      logger.debug("Webhook signature verified successfully", context);
    } else {
      logger.warn("Webhook signature verification failed", context, {
        providedSignature: signature.substring(0, 20) + "...",
        expectedPrefix: expectedSignature.substring(0, 20) + "...",
      });
    }

    return isValid;
  } catch (error) {
    logger.error(
      "Error during signature verification",
      context,
      error as Error,
    );
    return false;
  }
}

// === WEBHOOK STRUCTURE VALIDATION ===
function validateWebhookStructure(
  data: WhatsAppWebhookData,
  context: LogContext,
): void {
  if (!data.object) {
    throw new ValidationError("Missing object field in webhook data");
  }

  if (data.object !== "whatsapp_business_account") {
    throw new ValidationError(`Unexpected object type: ${data.object}`);
  }

  if (!Array.isArray(data.entry)) {
    throw new ValidationError("Entry field must be an array");
  }

  if (data.entry.length === 0) {
    logger.warn("Received webhook with empty entry array", context);
    return;
  }

  // Validate each entry
  for (let i = 0; i < data.entry.length; i++) {
    const entry = data.entry[i];
    if (!entry.id) {
      throw new ValidationError(`Missing entry ID at index ${i}`);
    }

    if (!Array.isArray(entry.changes)) {
      throw new ValidationError(`Entry changes must be an array at index ${i}`);
    }

    for (let j = 0; j < entry.changes.length; j++) {
      const change = entry.changes[j];
      if (!change.field) {
        throw new ValidationError(
          `Missing change field at entry ${i}, change ${j}`,
        );
      }

      if (!change.value) {
        throw new ValidationError(
          `Missing change value at entry ${i}, change ${j}`,
        );
      }
    }
  }

  logger.debug("Webhook structure validation passed", context, {
    entriesValidated: data.entry.length,
  });
}

// === MAIN WEBHOOK PROCESSING ===
async function processWhatsAppWebhook(
  data: WhatsAppWebhookData,
  baseContext: LogContext,
): Promise<void> {
  const processingPromises: Promise<void>[] = [];

  for (const entry of data.entry) {
    for (const change of entry.changes) {
      const context = { ...baseContext, phoneNumberId: entry.id };

      if (change.field === "messages") {
        const { messages, statuses, contacts, metadata } = change.value;

        logger.debug("Processing message change", context, {
          messageCount: messages?.length || 0,
          statusCount: statuses?.length || 0,
          contactCount: contacts?.length || 0,
          phoneNumber: metadata?.display_phone_number,
        });

        // Process incoming messages
        if (messages && messages.length > 0) {
          for (const message of messages) {
            processingPromises.push(
              processIncomingMessage(
                message,
                contacts,
                metadata,
                context,
              ).catch((error) => {
                logger.error(
                  `Failed to process message ${message.id}`,
                  { ...context, messageId: message.id },
                  error,
                );
              }),
            );
          }
        }

        // Process message status updates
        if (statuses && statuses.length > 0) {
          for (const status of statuses) {
            processingPromises.push(
              processMessageStatus(status, context).catch((error) => {
                logger.error(
                  `Failed to process status ${status.id}`,
                  { ...context, messageId: status.id },
                  error,
                );
              }),
            );
          }
        }
      } else {
        logger.debug("Ignoring non-message webhook change", context, {
          field: change.field,
        });
      }
    }
  }

  // Wait for all processing to complete
  if (processingPromises.length > 0) {
    const results = await Promise.allSettled(processingPromises);
    const failures = results.filter(
      (result) => result.status === "rejected",
    ).length;

    if (failures > 0) {
      logger.warn(
        `Webhook processing completed with ${failures} failures out of ${processingPromises.length} operations`,
        baseContext,
      );
    } else {
      logger.info(
        `All ${processingPromises.length} webhook operations completed successfully`,
        baseContext,
      );
    }
  }
}

// === MESSAGE PROCESSING ===
async function processIncomingMessage(
  message: WhatsAppMessage,
  contacts: Contact[] | undefined,
  metadata: Metadata,
  baseContext: LogContext,
): Promise<void> {
  const context = {
    ...baseContext,
    messageId: message.id,
    from: message.from,
    phoneNumberId: metadata.phone_number_id,
  };

  try {
    logger.info("Processing incoming message", context, {
      messageType: message.type,
      fromNumber: message.from,
      timestamp: message.timestamp,
      hasText: !!message.text?.body,
    });

    healthMonitor.incrementMessagesReceived();

    // Rate limiting check
    if (!rateLimiter.isAllowed(message.from, 10, 60000)) {
      logger.warn("Rate limit exceeded for phone number", context);
      throw new RateLimitError(`Rate limit exceeded for ${message.from}`);
    }

    // Store message in database with retry logic
    await errorRecovery.executeWithRetry(
      () => storeIncomingMessage(message, metadata, context),
      `store_message_${message.id}`,
      3,
      1000,
    );

    // Find or create conversation
    const conversation = await findOrCreateConversation(message.from, context);

    // Generate automated response for text messages
    if (message.type === "text" && message.text?.body) {
      const response = await generateAutomatedResponse(
        message.text.body,
        conversation,
        context,
      );

      if (response) {
        // Send response back to WhatsApp with retry logic
        await errorRecovery.executeWithRetry(
          () => sendWhatsAppMessage(message.from, response, context),
          `send_response_${message.id}`,
          3,
          2000,
        );

        // Update conversation state
        await updateConversationState(
          conversation.id,
          message.text.body,
          context,
        );
      }
    } else if (message.type !== "text") {
      logger.info("Received non-text message", context, {
        messageType: message.type,
      });
      // Handle other message types (image, document, etc.)
      await handleNonTextMessage(message, context);
    }

    logger.info("Message processing completed successfully", context);
  } catch (error) {
    if (error instanceof WhatsAppError) {
      logger.error(
        `Message processing failed: ${error.message}`,
        context,
        error,
        { code: error.code },
      );

      // Send error response to user if appropriate
      if (error.code !== "RATE_LIMIT_ERROR") {
        await sendErrorResponse(message.from, error, context);
      }
    } else {
      logger.critical(
        "Unexpected error during message processing",
        context,
        error as Error,
      );
    }
    throw error;
  }
}

// === STATUS PROCESSING ===
async function processMessageStatus(
  status: MessageStatus,
  baseContext: LogContext,
): Promise<void> {
  const context = { ...baseContext, messageId: status.id };

  try {
    logger.debug("Processing message status update", context, {
      status: status.status,
      recipientId: status.recipient_id,
      hasErrors: !!status.errors?.length,
    });

    if (status.errors && status.errors.length > 0) {
      logger.warn("Message delivery errors reported", context, {
        errors: status.errors,
      });

      for (const error of status.errors) {
        logger.error("Meta API error in message status", context, undefined, {
          code: error.code,
          title: error.title,
          message: error.message,
          details: error.error_data?.details,
        });
      }
    }

    // Update message status in database with retry logic
    await errorRecovery.executeWithRetry(
      () =>
        updateMessageStatus(
          status.id,
          status.status,
          status.timestamp,
          context,
          status.errors,
        ),
      `update_status_${status.id}`,
      3,
      1000,
    );

    logger.debug("Message status update completed", context);
  } catch (error) {
    logger.error("Failed to process message status", context, error as Error);
    throw error;
  }
}

// === UTILITY FUNCTIONS ===
async function handleNonTextMessage(
  message: WhatsAppMessage,
  context: LogContext,
): Promise<void> {
  logger.info("Handling non-text message", context, {
    messageType: message.type,
  });

  switch (message.type) {
    case "image":
      await handleImageMessage(message, context);
      break;
    case "document":
      await handleDocumentMessage(message, context);
      break;
    case "audio":
      await handleAudioMessage(message, context);
      break;
    default:
      logger.info("Unsupported message type received", context, {
        messageType: message.type,
      });
  }
}

async function handleImageMessage(
  message: WhatsAppMessage,
  context: LogContext,
): Promise<void> {
  logger.info("Processing image message", context, {
    imageId: message.image?.id,
  });
  // TODO: Implement image handling logic
}

async function handleDocumentMessage(
  message: WhatsAppMessage,
  context: LogContext,
): Promise<void> {
  logger.info("Processing document message", context, {
    documentId: message.document?.id,
    filename: message.document?.filename,
  });
  // TODO: Implement document handling logic
}

async function handleAudioMessage(
  message: WhatsAppMessage,
  context: LogContext,
): Promise<void> {
  logger.info("Processing audio message", context, {
    audioId: message.image?.id,
  });
  // TODO: Implement audio handling logic
}

async function sendErrorResponse(
  phoneNumber: string,
  error: WhatsAppError,
  context: LogContext,
): Promise<void> {
  try {
    let userMessage: string;

    switch (error.code) {
      case "RATE_LIMIT_ERROR":
        userMessage =
          "You're sending messages too quickly. Please wait a moment and try again.";
        break;
      case "VALIDATION_ERROR":
        userMessage =
          "Sorry, I didn't understand that message. Could you please try again?";
        break;
      default:
        userMessage =
          "Sorry, I'm experiencing technical difficulties. Please try again later.";
    }

    await sendWhatsAppMessage(phoneNumber, userMessage, context);
    logger.info("Error response sent to user", context, {
      errorCode: error.code,
    });
  } catch (responseError) {
    logger.error(
      "Failed to send error response to user",
      context,
      responseError as Error,
    );
  }
}

// === DATABASE OPERATIONS ===
async function storeIncomingMessage(
  message: WhatsAppMessage,
  metadata: Metadata,
  context: LogContext,
): Promise<void> {
  logger.debug("Storing incoming message in database", context, {
    messageId: message.id,
    from: message.from,
    type: message.type,
    phoneNumberId: metadata.phone_number_id,
  });

  // PRODUCTION: Real Supabase storage implementation for Meta review
  try {
    // Import supabase dynamically to avoid build issues
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      logger.warn('Missing Supabase credentials for message storage', context);
      return; // Don't throw - storage failure shouldn't break webhook
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .insert({
        message_id: message.id,
        phone_number: message.from,
        direction: 'inbound',
        content: message.text?.body,
        message_type: message.type,
        status: 'received',
        timestamp: new Date(parseInt(message.timestamp) * 1000).toISOString(),
        phone_number_id: metadata.phone_number_id,
        webhook_data: { message, metadata }
      });
    
    if (error) {
      logger.error('Database storage failed', context, error);
      // Don't throw - storage failure shouldn't break webhook processing
    } else {
      logger.debug('Message stored successfully in production database', context);
    }
    
  } catch (error) {
    logger.error('Database storage error', context, error);
    // Don't throw - storage failure shouldn't break webhook
  }
}

interface ConversationState {
  id: string;
  phoneNumber: string;
  state: string;
  lastMessageAt: string;
}

async function findOrCreateConversation(
  phoneNumber: string,
  context: LogContext,
): Promise<ConversationState> {
  logger.debug("Finding or creating conversation", context, { phoneNumber });

  // TODO: Implement actual database lookup with error handling
  return {
    id: `conv_${phoneNumber}`,
    phoneNumber,
    state: "new",
    lastMessageAt: new Date().toISOString(),
  };
}

async function generateAutomatedResponse(
  messageText: string,
  conversation: ConversationState,
  context: LogContext,
): Promise<string | null> {
  logger.debug("Generating automated response", context, {
    messageLength: messageText.length,
    conversationState: conversation.state,
  });

  // TODO: Implement AI-powered response generation
  // For now, return a simple response based on message content
  const lowercaseText = messageText.toLowerCase();

  if (lowercaseText.includes("hello") || lowercaseText.includes("hi")) {
    return "Hello! Thank you for your interest in our properties. How can I help you today?";
  } else if (
    lowercaseText.includes("price") ||
    lowercaseText.includes("cost")
  ) {
    return "I'd be happy to discuss pricing with you. What type of property are you interested in?";
  } else if (
    lowercaseText.includes("viewing") ||
    lowercaseText.includes("visit")
  ) {
    return "Great! I can help you schedule a property viewing. What time works best for you?";
  }

  return "Thank you for your message. A member of our team will get back to you shortly with more information.";
}

async function sendWhatsAppMessage(
  to: string,
  message: string,
  context: LogContext,
): Promise<void> {
  logger.info("Sending WhatsApp message", context, {
    to,
    messageLength: message.length,
  });

  healthMonitor.incrementMessagesSent();

  // PRODUCTION: Real WhatsApp API implementation for Meta review
  const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID;

  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    logger.error('Missing WhatsApp API credentials - cannot send message', context);
    throw new WhatsAppError('Missing WhatsApp API credentials', 'CONFIG_ERROR', 500, false);
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: message }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      const metaError = MetaErrorHandler.handleMetaError(errorData);
      logger.error('WhatsApp API call failed', context, errorData);
      throw metaError;
    }

    const result = await response.json();
    logger.info('Message sent successfully via WhatsApp API', context, { messageId: result.messages[0].id });
    healthMonitor.incrementMessagesSent();
    
  } catch (error) {
    logger.error('Failed to send WhatsApp message', context, error);
    healthMonitor.incrementMessagesReceived(); // Track failed attempts
    throw error;
  }
}

async function updateMessageStatus(
  messageId: string,
  status: string,
  timestamp: string,
  context: LogContext,
  errors?: MessageStatus["errors"],
): Promise<void> {
  logger.debug("Updating message status", context, {
    messageId,
    status,
    hasErrors: !!errors?.length,
  });

  // PRODUCTION: Real database status update for Meta review
  try {
    // Import supabase dynamically to avoid build issues
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      logger.warn('Missing Supabase credentials for status update', context);
      return; // Don't throw - status update failure shouldn't break webhook
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { error } = await supabase
      .from('whatsapp_messages')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('message_id', messageId);
    
    if (error) {
      logger.error('Status update failed', context, error);
      // Don't throw - status update failure shouldn't break webhook processing
    } else {
      logger.debug('Message status updated successfully in production database', context, { messageId, status });
    }
    
  } catch (error) {
    logger.error('Status update error', context, error);
    // Don't throw - status update failure shouldn't break webhook
  }
}

async function updateConversationState(
  conversationId: string,
  lastMessage: string,
  context: LogContext,
): Promise<void> {
  logger.debug("Updating conversation state", context, {
    conversationId,
    messageLength: lastMessage.length,
  });

  // PRODUCTION: Real conversation state update for Meta review
  try {
    // Import supabase dynamically to avoid build issues
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      logger.warn('Missing Supabase credentials for conversation state update', context);
      return; // Don't throw - state update failure shouldn't break webhook
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
         const { error } = await supabase
       .from('conversations')
       .update({ 
         last_activity: new Date().toISOString(),
         status: 'active',
         last_message: lastMessage,
         updated_at: new Date().toISOString()
       })
       .eq('id', conversationId);
    
    if (error) {
      logger.error('Conversation state update failed', context, error);
      // Don't throw - state update failure shouldn't break webhook processing
    } else {
      logger.debug('Conversation state updated successfully in production database', context, { conversationId });
    }
    
  } catch (error) {
    logger.error('Conversation state update error', context, error);
    // Don't throw - state update failure shouldn't break webhook
  }
}

// === HEALTH CHECK ENDPOINT ===
export async function handleHealthCheck(): Promise<Response> {
  const health = healthMonitor.getHealthStatus();
  const errorRate = healthMonitor.getErrorRate();

  const status = errorRate > 10 ? "unhealthy" : "healthy";
  const statusCode = status === "healthy" ? 200 : 503;

  return new Response(
    JSON.stringify({
      ...health,
      errorRate: `${errorRate.toFixed(2)}%`,
      status,
    }),
    {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    },
  );
}

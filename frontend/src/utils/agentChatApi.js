import { supabase } from '@/lib/supabaseClient';

/**
 * Agent Chat API - Handles all chat history operations with Claude AI integration
 * Provides real-time chat functionality with persistent storage
 */

// ============================================
// 1. SAVE MESSAGE TO DATABASE
// ============================================

/**
 * Save a new message to the chat history
 * @param {string} userId - The user's ID (agent_id in agent_chats table)
 * @param {string} messageType - 'user' or 'agent'
 * @param {string} message - The message content
 * @param {string} sessionId - Optional session ID for grouping conversations
 * @param {object} metadata - Optional metadata (attachments, formatting, etc.)
 * @returns {Promise<object>} The saved message object
 */
export const saveMessage = async (userId, messageType, message, sessionId = null, metadata = {}) => {
  try {
    const { data, error } = await supabase
      .from('agent_chats')
      .insert({
        agent_id: userId,
        message_type: messageType,
        message: message,
        session_id: sessionId,
        metadata: metadata,
        status: 'sent'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

/**
 * Save user message (convenience wrapper)
 */
export const saveUserMessage = async (userId, message, sessionId = null) => {
  return saveMessage(userId, 'user', message, sessionId);
};

/**
 * Save agent message (convenience wrapper)
 */
export const saveAgentMessage = async (userId, message, sessionId = null, metadata = {}) => {
  return saveMessage(userId, 'agent', message, sessionId, metadata);
};

// ============================================
// 2. RETRIEVE CHAT HISTORY
// ============================================

/**
 * Get all chat history for a user
 * @param {string} userId - The user's ID
 * @param {number} limit - Maximum number of messages to retrieve
 * @param {number} offset - Offset for pagination
 * @returns {Promise<array>} Array of message objects
 */
export const getChatHistory = async (userId, limit = 100, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from('agent_chats')
      .select('*')
      .eq('agent_id', userId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
};

/**
 * Get recent conversation context for AI memory
 * @param {string} userId - The user's ID
 * @param {number} messageCount - Number of recent messages to retrieve
 * @returns {Promise<array>} Array of recent messages
 */
export const getRecentContext = async (userId, messageCount = 10) => {
  try {
    const { data, error } = await supabase
      .from('agent_chats')
      .select('message_type, message, created_at')
      .eq('agent_id', userId)
      .order('created_at', { ascending: false })
      .limit(messageCount);

    if (error) throw error;
    
    // Reverse to get chronological order (oldest to newest)
    return (data || []).reverse();
  } catch (error) {
    console.error('Error fetching recent context:', error);
    throw error;
  }
};

/**
 * Get chat history for a specific session
 * @param {string} sessionId - The session ID
 * @returns {Promise<array>} Array of messages in the session
 */
export const getSessionHistory = async (sessionId) => {
  try {
    const { data, error } = await supabase
      .from('agent_chats')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching session history:', error);
    throw error;
  }
};

// ============================================
// 3. REAL-TIME SUBSCRIPTIONS
// ============================================

/**
 * Subscribe to real-time chat updates for a user
 * @param {string} userId - The user's ID
 * @param {function} onNewMessage - Callback function when new message arrives
 * @returns {object} Subscription object (call .unsubscribe() to stop)
 */
export const subscribeToChatUpdates = (userId, onNewMessage) => {
  const subscription = supabase
    .channel(`agent_chats:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'agent_chats',
        filter: `agent_id=eq.${userId}`
      },
      (payload) => {
        console.log('New message received:', payload.new);
        onNewMessage(payload.new);
      }
    )
    .subscribe();

  return subscription;
};

/**
 * Subscribe to all chat events (INSERT, UPDATE, DELETE)
 * @param {string} userId - The user's ID
 * @param {object} callbacks - Object with onInsert, onUpdate, onDelete callbacks
 * @returns {object} Subscription object
 */
export const subscribeToAllChatEvents = (userId, callbacks = {}) => {
  const { onInsert, onUpdate, onDelete } = callbacks;

  const subscription = supabase
    .channel(`agent_chats_all:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'agent_chats',
        filter: `agent_id=eq.${userId}`
      },
      (payload) => {
        console.log('Chat event:', payload);
        
        switch (payload.eventType) {
          case 'INSERT':
            onInsert?.(payload.new);
            break;
          case 'UPDATE':
            onUpdate?.(payload.new, payload.old);
            break;
          case 'DELETE':
            onDelete?.(payload.old);
            break;
        }
      }
    )
    .subscribe();

  return subscription;
};

// ============================================
// 4. MESSAGE MANAGEMENT
// ============================================

/**
 * Update message status (for read receipts)
 * @param {string} messageId - The message ID
 * @param {string} status - New status: 'sent', 'delivered', 'read', 'error'
 */
export const updateMessageStatus = async (messageId, status) => {
  try {
    const { data, error } = await supabase
      .from('agent_chats')
      .update({ status })
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating message status:', error);
    throw error;
  }
};

/**
 * Delete a message
 * @param {string} messageId - The message ID
 */
export const deleteMessage = async (messageId) => {
  try {
    const { error } = await supabase
      .from('agent_chats')
      .delete()
      .eq('id', messageId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

/**
 * Clear all chat history for a user
 * @param {string} userId - The user's ID
 */
export const clearChatHistory = async (userId) => {
  try {
    const { error } = await supabase
      .from('agent_chats')
      .delete()
      .eq('agent_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error clearing chat history:', error);
    throw error;
  }
};

// ============================================
// 5. CLAUDE AI INTEGRATION (WITH MEMORY/CONTEXT)
// ============================================

/**
 * Build a rich system prompt from user profile, proofs, agent config, and domain questions
 * @param {object} profile - User profile from profiles table
 * @param {array} proofs - User proofs array
 * @param {object} agent - Mini-Them agent configuration
 * @param {object} domainQuestions - Domain questions responses from domain_questions_professionals table
 * @returns {string} System prompt for Claude
 */

export const buildSystemPrompt = (profile, proofs, agent, domainQuestions = null) => {
  const safe = (val) => val || 'Not specified';
  
  const proofLines = (proofs || [])
    .slice(0, 10)
    .map(p => `- [${p.proof_type}] ${p.proof_name} (${p.status})${p.summary ? `: ${p.summary.substring(0, 120)}` : ''}`)
    .join('\n');

  // Build domain questions context
  let domainContext = '';
  if (domainQuestions) {
    domainContext = `
## MARKET PERSONALIZATION (NIGERIA)
Based on the user's domain questions responses, you have deep knowledge about their specific market context:

Platform Usage Goals:
${(domainQuestions.platform_usage || []).map(goal => `- ${goal}`).join('\n')}

Primary Markets/Industries:
${(domainQuestions.market_industry || []).map(industry => `- ${industry}`).join('\n')}
${domainQuestions.other_industry ? `- Other: ${domainQuestions.other_industry}` : ''}

Operating Region:
- ${domainQuestions.state_region || 'Not specified'}
${domainQuestions.other_state_region ? `  (Specifically: ${domainQuestions.other_state_region})` : ''}

Target End Consumers:
${(domainQuestions.end_consumer || []).map(consumer => `- ${consumer}`).join('\n')}

USE THIS CONTEXT TO:
- Tailor all marketing advice to these specific industries and consumer segments
- Reference local market conditions in ${domainQuestions.state_region || 'their region'}
- Provide examples relevant to their target demographics
- Suggest strategies that align with their platform usage goals
- Use pricing, channels, and tactics appropriate for their market segments
`;
  }

  return `You are Mini-Them AI, the digital twin of ${safe(profile?.name || profile?.display_name || 'a Ghonsi Proof user')} on the Ghonsi Proof platform.

CRITICAL IDENTITY RULE: You ARE the user. You do not speak about them in third person. You speak as them, with their knowledge, skills, and experience. When drafting proposals, messages, or applications, you write in first person as the user.

## MARKETING SPECIALIZATION (NIGERIA ONLY)
You are a specialist in marketing within the Nigerian market. You ONLY discuss topics directly related to marketing in Nigeria — this includes digital advertising, social media strategy, consumer behaviour, brand building, pricing, distribution, local regulations, and case studies of Nigerian brands. You automatically adapt any general marketing concept (SEO, email marketing, etc.) to the Nigerian context, using local examples and naira (₦) where appropriate.

If asked a question that is NOT about marketing in Nigeria, reply politely but firmly as the user would: "My expertise is in Nigerian marketing. Please ask me something related to that, like how to launch a new product in Lagos or how to use WhatsApp for customer engagement in Nigeria." Do not attempt to answer off‑topic questions.
${domainContext}
## USER PROFILE
Name: ${safe(profile?.name || profile?.display_name)}
Bio: ${safe(profile?.bio)}
Skills: ${safe(profile?.skills?.join(', ') || profile?.skills)}
Experience: ${safe(profile?.experience)}
Education: ${safe(profile?.education)}
Location: ${safe(profile?.location)}
${profile?.website ? `Website: ${profile.website}` : ''}

## VERIFIED PROOFS
${proofLines || 'No verified proofs yet.'}

## AGENT CONFIGURATION
Agent Name: ${safe(agent?.agent_name)}
Learned Skills: ${safe(agent?.learned_skills?.join(', '))}
Style Summary: ${safe(agent?.style_summary)}
${agent?.custom_instructions ? `Custom Instructions: ${agent.custom_instructions}` : ''}

## GROUND TRUTH INSTRUCTIONS
- You are a ZERO HALLUCINATION system. Only state facts that are explicitly present in the user profile or verified proofs above.
- When asked about marketing topics, reference your specific skills, proofs, and experience from the profile. Speak from personal experience.
- If asked about something not in the profile or proofs, explicitly say: "I don't have that information in my profile or verified proofs."
- Never invent, assume, or extrapolate information about your background or achievements. If uncertain, ask for clarification rather than guessing.
- Treat the profile and proofs as your own memory. You are not an assistant researching the user — you ARE the user.

## RESPONSE STYLE
- Respond in a natural, conversational tone — like a confident professional speaking to a colleague.
- NEVER use markdown headers (##, ###), single asterisks (*), or double asterisks (**). No bold, no italic, no formatting markers whatsoever.
- Plain text only. If you need to emphasize something important, use natural emphasis through word choice and sentence structure — never formatting.
- Use plain paragraphs and occasional simple lists only when they genuinely improve readability.
- Be concise but thorough — get straight to the point without filler or preamble.
- Avoid robotic formatting, numbered steps, or overly structured responses unless specifically requested.
- Write as if you're speaking directly to someone in a professional conversation.
- When the user asks you to act on their behalf (apply, draft, propose), do it immediately in first person without asking for permission.`;
};

/**
 * Strip all markdown formatting markers from AI response
 * @param {string} text - Raw AI response
 * @returns {string} Clean text with no asterisks or other markdown
 */
const stripMarkdown = (text) => {
  if (!text) return text;
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')   // bold **text**
    .replace(/\*(.*?)\*/g, '$1')       // italic *text*
    .replace(/__(.*?)__/g, '$1')       // underline __text__
    .replace(/_(.*?)_/g, '$1')         // italic _text_
    .replace(/`(.*?)`/g, '$1')         // inline code `text`
    .replace(/#{1,6}\s+/g, '')         // headers # text
    .replace(/>\s+/g, '')              // blockquote > text
    .trim();
};

/**
 * Get AI response from Claude with conversation context

 * Integrates with your existing claude-chat Edge Function
 * @param {string} userId - The user's ID
 * @param {string} userMessage - The user's message
 * @param {number} contextWindow - Number of recent messages to include
 * @param {object} userContext - Optional {profile, proofs, agent, domainQuestions} for personalized responses
 * @returns {Promise<string>} Claude's response
 */
export const getClaudeResponse = async (userId, userMessage, contextWindow = 10, userContext = null) => {
  try {
    // 1. Get recent conversation context
    const recentMessages = await getRecentContext(userId, contextWindow);
    
    // 2. Build conversation history for Claude
    const conversationHistory = recentMessages.map(msg => ({
      role: msg.message_type === 'user' ? 'user' : 'assistant',
      content: msg.message
    }));
    
    // 3. Add current user message
    conversationHistory.push({
      role: 'user',
      content: userMessage
    });
    
    // 4. Build system prompt (personalized if context provided)
    const systemPrompt = userContext
      ? buildSystemPrompt(userContext.profile, userContext.proofs, userContext.agent, userContext.domainQuestions)
      : 'You are a helpful AI assistant for Ghonsi Proof. You help users with their portfolio, proofs, and professional development. Be concise, friendly, and actionable.';
    
    // 5. Get auth token
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    
    // 6. Call Claude via Edge Function
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/claude-chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: systemPrompt,
          messages: conversationHistory
        }),
      }
    );

    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error (${response.status}): ${errorText}`);
    }
    
    const result = await response.json();
    const rawResponse = result.content[0].text;
    
    // Strip any markdown formatting that slipped through
    const aiResponse = stripMarkdown(rawResponse);
    
    // 6. Save AI response to database

    await saveAgentMessage(userId, aiResponse, null, {
      model: 'claude-haiku-4-5-20251001',
      timestamp: new Date().toISOString(),
      context_window: contextWindow
    });
    
    return aiResponse;
    
  } catch (error) {
    console.error('Error getting Claude response:', error);
    throw error;
  }
};

/**
 * Chat with agent - Complete flow (save user message + get AI response)
 * This is the main function to use in your chat UI
 * @param {string} userId - The user's ID
 * @param {string} message - The user's message
 * @param {object} userContext - Optional {profile, proofs, agent} for personalized responses
 * @returns {Promise<string>} Claude's response
 */
export const chatWithAgent = async (userId, message, userContext = null) => {
  try {
    // 1. Save user message
    await saveUserMessage(userId, message);
    
    // 2. Get AI response (which also saves it)
    const response = await getClaudeResponse(userId, message, 10, userContext);
    
    return response;

  } catch (error) {
    console.error('Error in chat flow:', error);
    
    // Save error message
    const errorMsg = 'Sorry, I encountered an error. Please try again.';
    await saveAgentMessage(userId, errorMsg, null, { error: true });
    
    throw error;
  }
};

/**
 * Get conversation summary statistics
 * @param {string} userId - The user's ID
 * @returns {Promise<object>} Statistics object
 */
export const getChatStats = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('agent_chats')
      .select('message_type, created_at')
      .eq('agent_id', userId);

    if (error) throw error;

    const stats = {
      totalMessages: data.length,
      userMessages: data.filter(m => m.message_type === 'user').length,
      agentMessages: data.filter(m => m.message_type === 'agent').length,
      firstMessage: data.length > 0 ? data[0].created_at : null,
      lastMessage: data.length > 0 ? data[data.length - 1].created_at : null
    };

    return stats;
  } catch (error) {
    console.error('Error fetching chat stats:', error);
    throw error;
  }
};

// ============================================
// 6. SESSION MANAGEMENT
// ============================================

/**
 * Create a new chat session
 * @param {string} userId - The user's ID
 * @returns {string} New session ID
 */
export const createNewSession = () => {
  return crypto.randomUUID();
};

/**
 * Get all sessions for a user
 * @param {string} userId - The user's ID
 * @returns {Promise<array>} Array of unique session IDs
 */
export const getUserSessions = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('agent_chats')
      .select('session_id, created_at')
      .eq('agent_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get unique session IDs
    const uniqueSessions = [...new Set(data.map(m => m.session_id))];
    return uniqueSessions;
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    throw error;
  }
};

// Demo stub for OpenAI

// Constants
const OPENAI_MODELS = { EMBEDDING: 'demo-embed', CHAT: 'demo-chat' } as const;

const DEFAULTS = {
  TEMPERATURE: 0.7,
  MAX_TOKENS: 2000,
} as const;

const ERROR_MESSAGES = {
  EMBEDDING_FAILED: 'Failed to generate embedding',
  EMBEDDINGS_FAILED: 'Failed to generate embeddings',
  CHAT_FAILED: 'Failed to generate chat response',
  INVALID_INPUT: 'Invalid input provided',
} as const;

// Types
export interface EmbeddingResult {
  embedding: number[];
  text: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: any;
  };
}

interface EmbeddingRequestOptions {
  model: string;
  input: string | string[];
}

// OpenAI Client Setup
const openai = {} as any;

// Helper functions
const validateInput = (input: string | string[]): void => {
  if (!input || (Array.isArray(input) && input.length === 0)) {
    throw new Error(ERROR_MESSAGES.INVALID_INPUT);
  }
  
  if (Array.isArray(input) && input.some(text => !text || typeof text !== 'string')) {
    throw new Error(ERROR_MESSAGES.INVALID_INPUT);
  }
  
  if (typeof input === 'string' && input.trim().length === 0) {
    throw new Error(ERROR_MESSAGES.INVALID_INPUT);
  }
};

const createEmbeddingOptions = (input: string | string[]): EmbeddingRequestOptions => ({
  model: OPENAI_MODELS.EMBEDDING,
  input,
});

const createChatCompletionOptions = (
  messages: ChatMessage[],
  tools?: ChatTool[],
  temperature: number = DEFAULTS.TEMPERATURE
) => ({
  model: OPENAI_MODELS.CHAT,
  messages,
  tools,
  tool_choice: tools ? 'auto' as const : undefined,
  temperature,
  max_tokens: DEFAULTS.MAX_TOKENS,
});

const handleOpenAIError = (error: any, message: string): never => {
  console.error(`OpenAI API Error - ${message}:`, error);
  throw new Error(message);
};

// Main API functions
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    validateInput(text);
    
    const options = createEmbeddingOptions(text);
    // Return deterministic small embedding
    return Array.from({ length: 8 }, (_, i) => (i + text.length) / 100);
  } catch (error) {
    if (error instanceof Error && error.message === ERROR_MESSAGES.INVALID_INPUT) {
      throw error;
    }
    return handleOpenAIError(error, ERROR_MESSAGES.EMBEDDING_FAILED);
  }
}

export async function generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
  try {
    validateInput(texts);
    
    const options = createEmbeddingOptions(texts);
    return texts.map((t) => ({
      embedding: Array.from({ length: 8 }, (_, i) => (i + t.length) / 100),
      text: t
    }));
  } catch (error) {
    if (error instanceof Error && error.message === ERROR_MESSAGES.INVALID_INPUT) {
      throw error;
    }
    return handleOpenAIError(error, ERROR_MESSAGES.EMBEDDINGS_FAILED);
  }
}

export async function chatCompletion(
  messages: ChatMessage[],
  tools?: ChatTool[],
  temperature: number = DEFAULTS.TEMPERATURE
) {
  try {
    if (!messages || messages.length === 0) {
      throw new Error(ERROR_MESSAGES.INVALID_INPUT);
    }

    const options = createChatCompletionOptions(messages, tools, temperature);
    return {
      id: 'demo-chat-id',
      choices: [
        {
          index: 0,
          message: { role: 'assistant', content: 'This is a demo response.' },
          finish_reason: 'stop'
        }
      ]
    } as any;
  } catch (error) {
    if (error instanceof Error && error.message === ERROR_MESSAGES.INVALID_INPUT) {
      throw error;
    }
    return handleOpenAIError(error, ERROR_MESSAGES.CHAT_FAILED);
  }
}

// Export the client for advanced usage
export { openai };

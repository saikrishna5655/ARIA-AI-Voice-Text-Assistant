export interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  agent?: string;
  imageUrl?: string;
  isThinking?: boolean;
}

export interface VoiceAssistantConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface Agent {
  name: string;
  description: string;
  execute: (command: string, context?: any) => Promise<AgentResult>;
}

export interface AgentResult {
  success: boolean;
  message: string;
  data?: any;
  action?: string;
  imageUrl?: string;
}

export interface VoiceRecognitionState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  confidence: number;
  error?: string;
  isAlwaysListening?: boolean;
}
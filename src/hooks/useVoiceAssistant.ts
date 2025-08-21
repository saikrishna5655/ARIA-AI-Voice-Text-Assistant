import { useState, useCallback, useRef, useEffect } from 'react';
import { Message, VoiceAssistantConfig, Agent } from '../types';
import VoiceService from '../services/voiceService';
import GeminiService from '../services/geminiService';
import WebsiteAgent from '../agents/websiteAgent';
import InformationAgent from '../agents/informationAgent';
import TaskAgent from '../agents/taskAgent';

const defaultConfig: VoiceAssistantConfig = {
  apiKey: '',
  model: 'gemini-2.0-flash-exp',
  maxTokens: 1000,
  temperature: 0.7
};

export const useVoiceAssistant = (config: Partial<VoiceAssistantConfig> = {}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isAlwaysListening, setIsAlwaysListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const voiceServiceRef = useRef<VoiceService>();
  const geminiServiceRef = useRef<GeminiService>();
  const agentsRef = useRef<Agent[]>([]);

  const assistantConfig = { ...defaultConfig, ...config };

  useEffect(() => {
    voiceServiceRef.current = new VoiceService();
    geminiServiceRef.current = new GeminiService(assistantConfig);
    agentsRef.current = [
      new WebsiteAgent(),
      new InformationAgent(),
      new TaskAgent()
    ];
  }, []);

  const addMessage = useCallback((message: Omit<Message, 'id'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  const updateMessage = useCallback((messageId: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, ...updates } : msg
    ));
  }, []);
  const processCommand = useCallback(async (userInput: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Add user message
      addMessage({
        type: 'user',
        content: userInput,
        timestamp: new Date()
      });

      // Add thinking message
      const thinkingMessage = addMessage({
        type: 'assistant',
        content: '',
        timestamp: new Date(),
        isThinking: true
      });
      // Check if this is a website command
      const websiteAgent = agentsRef.current.find(agent => agent.name === 'WebsiteAgent');
      if (websiteAgent && (
        userInput.toLowerCase().includes('open') || 
        userInput.toLowerCase().includes('go to') ||
        userInput.toLowerCase().includes('visit') ||
        userInput.toLowerCase().includes('navigate')
      )) {
        const result = await websiteAgent.execute(userInput);
        if (result.success) {
          updateMessage(thinkingMessage.id, {
            content: result.message,
            agent: websiteAgent.name,
            isThinking: false
          });
          if (voiceServiceRef.current) {
            voiceServiceRef.current.speak(result.message);
          }
          return;
        }
      }

      // Get AI response
      if (!assistantConfig.apiKey) {
        throw new Error('Gemini API key is required. Please add your API key in the settings.');
      }

      const response = await geminiServiceRef.current!.generateResponse(messages, userInput);
      
      // Check if AI wants to execute a website command
      if (response.text.includes('WEBSITE_COMMAND:')) {
        const urlMatch = response.text.match(/WEBSITE_COMMAND:\s*(.+)/);
        if (urlMatch && websiteAgent) {
          const result = await websiteAgent.execute(urlMatch[1]);
          const message = result.success ? result.message : 'I had trouble opening that website.';
          
          updateMessage(thinkingMessage.id, {
            content: message,
            agent: websiteAgent.name,
            isThinking: false
          });
          
          if (voiceServiceRef.current) {
            voiceServiceRef.current.speak(message);
          }
          return;
        }
      }

      // Add AI response
      updateMessage(thinkingMessage.id, {
        content: response.text,
        imageUrl: response.imageUrl,
        isThinking: false
      });

      // Speak the response
      if (voiceServiceRef.current) {
        voiceServiceRef.current.speak(response.text);
      }

    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred.';
      setError(errorMessage);
      
      // Remove thinking message and add error
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));
      addMessage({
        type: 'system',
        content: `Error: ${errorMessage}`,
        timestamp: new Date()
      });
    } finally {
      setIsProcessing(false);
    }
  }, [messages, assistantConfig.apiKey, addMessage, updateMessage]);

  const startListening = useCallback(() => {
    if (!voiceServiceRef.current?.isSupported()) {
      setError('Speech recognition is not supported in your browser.');
      return;
    }

    const alwaysListening = !isAlwaysListening;
    setIsAlwaysListening(alwaysListening);

    setCurrentTranscript('');
    setError(null);

    const success = voiceServiceRef.current.startListening(
      (transcript) => {
        setCurrentTranscript(transcript);
        if (transcript.trim()) {
          processCommand(transcript);
        }
      },
      (state) => {
        setIsListening(state.isListening);
        setIsAlwaysListening(state.isAlwaysListening || false);
        if (state.error) {
          setError(`Speech recognition error: ${state.error}`);
        }
      },
      alwaysListening
    );

    if (!success) {
      setError('Failed to start voice recognition.');
      setIsAlwaysListening(false);
    }
  }, [processCommand]);

  const stopListening = useCallback(() => {
    voiceServiceRef.current?.stopListening();
    setIsListening(false);
    setIsAlwaysListening(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const updateConfig = useCallback((newConfig: Partial<VoiceAssistantConfig>) => {
    if (geminiServiceRef.current) {
      geminiServiceRef.current.updateConfig(newConfig);
    }
  }, []);

  return {
    messages,
    isListening,
    isAlwaysListening,
    isSpeaking,
    isProcessing,
    currentTranscript,
    error,
    isSupported: voiceServiceRef.current?.isSupported() ?? false,
    startListening,
    stopListening,
    processCommand,
    clearMessages,
    updateConfig,
    setError
  };
};
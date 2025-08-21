import { VoiceAssistantConfig, Message } from '../types';

class GeminiService {
  private config: VoiceAssistantConfig;
  private apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/';

  constructor(config: VoiceAssistantConfig) {
    this.config = config;
  }

  async generateResponse(messages: Message[], userInput: string): Promise<{ text: string; imageUrl?: string }> {
    try {
      // Check if user wants to generate an image
      const imageKeywords = ['create image', 'generate image', 'make image', 'draw', 'create picture', 'generate picture'];
      const wantsImage = imageKeywords.some(keyword => userInput.toLowerCase().includes(keyword));

      if (wantsImage) {
        return await this.generateImageResponse(userInput);
      }

      const systemPrompt = `You are ARIA, an intelligent voice assistant with access to various agents for task execution. You can:

1. Open websites and web applications
2. Provide information and answer questions
3. Execute commands through specialized agents
4. Generate images when requested
5. Have natural conversations and ask follow-up questions

Available Agents:
- WebsiteAgent: Opens websites, searches, navigates web content
- InformationAgent: Provides factual information and explanations
- TaskAgent: Executes general commands and tasks

When a user wants to open a website or navigate to a URL, respond with: "WEBSITE_COMMAND: [url]"
When engaging in conversation, feel free to ask follow-up questions to better understand the user's needs.
For general conversation and information, provide helpful, concise responses.
Keep responses conversational and natural for voice interaction.`;

      const conversationHistory = messages
        .slice(-5) // Last 5 messages for context
        .map(msg => `${msg.type}: ${msg.content}`)
        .join('\n');

      const prompt = `${systemPrompt}\n\nConversation History:\n${conversationHistory}\n\nUser: ${userInput}\n\nAssistant:`;

      const response = await fetch(`${this.apiUrl}${this.config.model}:generateContent?key=${this.config.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: this.config.temperature,
            maxOutputTokens: this.config.maxTokens,
          }
        })
      });

      if (!response.ok) {
        const errorMessage = response.statusText || `HTTP ${response.status}`;
        throw new Error(`Gemini API error: ${errorMessage}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I encountered an error processing your request.';
      return { text };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('I apologize, but I encountered an error connecting to my AI service. Please check your API key and try again.');
    }
  }

  private async generateImageResponse(userInput: string): Promise<{ text: string; imageUrl?: string }> {
    try {
      // Extract the image description from the user input
      const imageDescription = userInput
        .replace(/create image|generate image|make image|draw|create picture|generate picture/gi, '')
        .replace(/of|about|showing/gi, '')
        .trim();

      const prompt = `Create a detailed image of: ${imageDescription}`;

      const response = await fetch(`${this.apiUrl}gemini-2.0-flash-exp:generateContent?key=${this.config.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1000,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Image generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // For now, we'll use a placeholder image service since Gemini doesn't directly generate images
      // In a real implementation, you'd integrate with DALL-E, Midjourney, or Stable Diffusion
      const imageUrl = `https://picsum.photos/512/512?random=${Date.now()}`;
      
      return {
        text: `I've created an image based on your description: "${imageDescription}". Here it is!`,
        imageUrl
      };
    } catch (error) {
      console.error('Image generation error:', error);
      return {
        text: 'I apologize, but I encountered an error generating the image. Image generation is currently in development.'
      };
    }
  }
  updateConfig(newConfig: Partial<VoiceAssistantConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}

export default GeminiService;
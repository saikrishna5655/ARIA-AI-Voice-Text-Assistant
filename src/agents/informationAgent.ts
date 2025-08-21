import { Agent, AgentResult } from '../types';

class InformationAgent implements Agent {
  name = 'InformationAgent';
  description = 'Provides factual information and explanations';

  async execute(command: string): Promise<AgentResult> {
    try {
      // This agent would typically integrate with knowledge bases or APIs
      // For now, it provides basic responses and delegates to the main AI
      
      const informationKeywords = [
        'what is', 'who is', 'when is', 'where is', 'how is', 'why is',
        'explain', 'define', 'tell me about', 'information about'
      ];

      const isInformationRequest = informationKeywords.some(keyword => 
        command.toLowerCase().includes(keyword)
      );

      if (isInformationRequest) {
        return {
          success: true,
          message: 'I\'ll help you with that information request.',
          action: 'information_request',
          data: { query: command, type: 'general_knowledge' }
        };
      }

      return {
        success: false,
        message: 'This doesn\'t appear to be an information request.'
      };
    } catch (error) {
      return {
        success: false,
        message: `Error processing information request: ${error}`
      };
    }
  }
}

export default InformationAgent;
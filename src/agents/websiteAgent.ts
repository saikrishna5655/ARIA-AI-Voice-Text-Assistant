import { Agent, AgentResult } from '../types';

class WebsiteAgent implements Agent {
  name = 'WebsiteAgent';
  description = 'Opens websites, searches, and navigates web content';

  async execute(command: string): Promise<AgentResult> {
    try {
      const url = this.extractUrl(command);
      if (url) {
        window.open(url, '_blank');
        return {
          success: true,
          message: `Opening ${url}`,
          action: 'website_opened',
          data: { url }
        };
      } else {
        const searchQuery = this.extractSearchQuery(command);
        if (searchQuery) {
          const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
          window.open(searchUrl, '_blank');
          return {
            success: true,
            message: `Searching for "${searchQuery}"`,
            action: 'search_executed',
            data: { query: searchQuery, url: searchUrl }
          };
        }
      }

      return {
        success: false,
        message: 'Could not identify a website or search query from your command.'
      };
    } catch (error) {
      return {
        success: false,
        message: `Error executing website command: ${error}`
      };
    }
  }

  private extractUrl(command: string): string | null {
    // Look for explicit URLs
    const urlRegex = /(https?:\/\/[^\s]+)|([a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.)+[a-zA-Z]{2,}/g;
    const matches = command.match(urlRegex);
    
    if (matches) {
      let url = matches[0];
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }
      return url;
    }

    // Look for common website patterns
    const websitePatterns = {
      'youtube': 'https://www.youtube.com',
      'google': 'https://www.google.com',
      'facebook': 'https://www.facebook.com',
      'twitter': 'https://www.twitter.com',
      'instagram': 'https://www.instagram.com',
      'linkedin': 'https://www.linkedin.com',
      'github': 'https://www.github.com',
      'reddit': 'https://www.reddit.com',
      'wikipedia': 'https://www.wikipedia.org',
      'amazon': 'https://www.amazon.com',
      'netflix': 'https://www.netflix.com',
      'gmail': 'https://mail.google.com'
    };

    for (const [keyword, url] of Object.entries(websitePatterns)) {
      if (command.toLowerCase().includes(keyword)) {
        return url;
      }
    }

    return null;
  }

  private extractSearchQuery(command: string): string | null {
    const searchPatterns = [
      /search (?:for )?(.+)/i,
      /look up (.+)/i,
      /find (.+)/i,
      /google (.+)/i
    ];

    for (const pattern of searchPatterns) {
      const match = command.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return null;
  }
}

export default WebsiteAgent;
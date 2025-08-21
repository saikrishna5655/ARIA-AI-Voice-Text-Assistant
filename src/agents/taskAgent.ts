import { Agent, AgentResult } from '../types';

class TaskAgent implements Agent {
  name = 'TaskAgent';
  description = 'Executes general commands and tasks';

  async execute(command: string): Promise<AgentResult> {
    try {
      const taskPatterns = {
        time: /what time|current time|time now/i,
        date: /what date|today's date|current date/i,
        weather: /weather|temperature/i,
        reminder: /remind me|set reminder/i,
        calculator: /calculate|math|compute/i
      };

      for (const [taskType, pattern] of Object.entries(taskPatterns)) {
        if (pattern.test(command)) {
          return await this.executeTask(taskType, command);
        }
      }

      return {
        success: false,
        message: 'I couldn\'t identify a specific task to execute.'
      };
    } catch (error) {
      return {
        success: false,
        message: `Error executing task: ${error}`
      };
    }
  }

  private async executeTask(taskType: string, command: string): Promise<AgentResult> {
    switch (taskType) {
      case 'time':
        const currentTime = new Date().toLocaleTimeString();
        return {
          success: true,
          message: `The current time is ${currentTime}`,
          action: 'time_provided',
          data: { time: currentTime }
        };

      case 'date':
        const currentDate = new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        return {
          success: true,
          message: `Today is ${currentDate}`,
          action: 'date_provided',
          data: { date: currentDate }
        };

      case 'weather':
        return {
          success: true,
          message: 'I would need access to a weather API to provide current weather information. This feature can be implemented by integrating with services like OpenWeatherMap.',
          action: 'weather_requested',
          data: { location: 'unknown' }
        };

      case 'reminder':
        return {
          success: true,
          message: 'Reminder functionality would require additional implementation with local storage or external services.',
          action: 'reminder_requested',
          data: { reminder: command }
        };

      case 'calculator':
        const mathResult = this.evaluateMath(command);
        if (mathResult !== null) {
          return {
            success: true,
            message: `The result is ${mathResult}`,
            action: 'calculation_performed',
            data: { result: mathResult, expression: command }
          };
        }
        break;
    }

    return {
      success: false,
      message: `Could not execute task: ${taskType}`
    };
  }

  private evaluateMath(command: string): number | null {
    try {
      // Extract mathematical expressions (basic implementation)
      const mathRegex = /(\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*(\d+(?:\.\d+)?)/;
      const match = command.match(mathRegex);
      
      if (match) {
        const [, num1, operator, num2] = match;
        const a = parseFloat(num1);
        const b = parseFloat(num2);

        switch (operator) {
          case '+': return a + b;
          case '-': return a - b;
          case '*': return a * b;
          case '/': return b !== 0 ? a / b : null;
        }
      }
    } catch (error) {
      console.error('Math evaluation error:', error);
    }
    return null;
  }
}

export default TaskAgent;
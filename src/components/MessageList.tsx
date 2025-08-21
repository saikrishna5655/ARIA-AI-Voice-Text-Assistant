import React from 'react';
import { Message } from '../types';
import { User, Bot, AlertCircle, Zap, Image as ImageIcon } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Start a conversation with your voice assistant</p>
          <p className="text-sm mt-2">Click the microphone or type a message to begin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex items-start gap-3 ${
            message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.type === 'user'
                ? 'bg-blue-500'
                : message.type === 'system'
                ? 'bg-red-500'
                : 'bg-green-500'
            }`}
          >
            {message.type === 'user' ? (
              <User className="w-4 h-4 text-white" />
            ) : message.type === 'system' ? (
              <AlertCircle className="w-4 h-4 text-white" />
            ) : (
              <Bot className="w-4 h-4 text-white" />
            )}
          </div>

          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 ${
              message.type === 'user'
                ? 'bg-blue-500 text-white ml-auto'
                : message.type === 'system'
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-white shadow-md border'
            }`}
          >
            {message.isThinking && (
              <div className="flex items-center gap-2 mb-2 text-gray-500">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm">Thinking...</span>
              </div>
            )}
            
            <p className="text-sm">{message.content}</p>
            
            {message.imageUrl && (
              <div className="mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-500">Generated Image</span>
                </div>
                <img
                  src={message.imageUrl}
                  alt="Generated content"
                  className="max-w-full h-auto rounded-lg shadow-md"
                  loading="lazy"
                />
                <a
                  href={message.imageUrl}
                  download="generated-image.jpg"
                  className="text-blue-500 hover:underline text-sm mt-2"
                >
                  Download Image
                </a>
              </div>
            )}
            
            {message.agent && (
              <div className="flex items-center gap-1 mt-1 opacity-75">
                <Zap className="w-3 h-3" />
                <span className="text-xs">{message.agent}</span>
              </div>
            )}
            <div
              className={`text-xs mt-1 opacity-75 ${
                message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}
            >
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
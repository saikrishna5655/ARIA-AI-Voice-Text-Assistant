import React from 'react';
import { Mic, MicOff, Loader, Volume2 } from 'lucide-react';

interface VoiceButtonProps {
  isListening: boolean;
  isProcessing: boolean;
  isAlwaysListening: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({
  isListening,
  isProcessing,
  isAlwaysListening,
  onClick,
  disabled = false
}) => {
  return (
    <div className="relative flex flex-col items-center">
      {/* Modern Listening Visualization */}
      {(isListening || isAlwaysListening) && (
        <div className="absolute -top-8 flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-1 bg-gradient-to-t from-blue-400 to-purple-500 rounded-full animate-pulse`}
              style={{
                height: `${Math.random() * 20 + 10}px`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '0.8s'
              }}
            />
          ))}
        </div>
      )}

      <button
        onClick={onClick}
        disabled={disabled || isProcessing}
        className={`
          relative w-20 h-20 rounded-full flex items-center justify-center
          transition-all duration-300 transform hover:scale-105
          focus:outline-none focus:ring-4 focus:ring-blue-200
          ${isAlwaysListening
            ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-200'
            : isListening
            ? 'bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-200 animate-pulse'
            : 'bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-200'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {isProcessing ? (
          <Loader className="w-8 h-8 text-white animate-spin" />
        ) : isAlwaysListening ? (
          <Volume2 className="w-8 h-8 text-white" />
        ) : isListening ? (
          <MicOff className="w-8 h-8 text-white" />
        ) : (
          <Mic className="w-8 h-8 text-white" />
        )}
        
        {(isListening || isAlwaysListening) && (
          <>
            <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-white/20 animate-pulse" />
          </>
        )}
      </button>

      {/* Status Text */}
      <div className="mt-2 text-center">
        <p className="text-sm font-medium text-gray-700">
          {isAlwaysListening ? 'Always Listening' : isListening ? 'Listening...' : 'Click to Speak'}
        </p>
        {isAlwaysListening && (
          <p className="text-xs text-gray-500">Click to stop</p>
        )}
      </div>
    </div>
  );
};

export default VoiceButton;
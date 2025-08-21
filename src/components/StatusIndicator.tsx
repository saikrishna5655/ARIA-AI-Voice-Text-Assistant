import React from 'react';
import { Wifi, WifiOff, Activity, Clock } from 'lucide-react';

interface StatusIndicatorProps {
  isListening: boolean;
  isProcessing: boolean;
  isSupported: boolean;
  error: string | null;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isListening,
  isProcessing,
  isSupported,
  error
}) => {
  if (error) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg border border-red-200">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm">Error: {error}</span>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg border border-yellow-200">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm">Speech recognition not supported</span>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg border border-blue-200">
        <Clock className="w-4 h-4 animate-spin" />
        <span className="text-sm">Processing...</span>
      </div>
    );
  }

  if (isListening) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg border border-green-200">
        <Activity className="w-4 h-4" />
        <span className="text-sm">Listening...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg border border-gray-200">
      <Wifi className="w-4 h-4" />
      <span className="text-sm">Ready</span>
    </div>
  );
};

export default StatusIndicator;
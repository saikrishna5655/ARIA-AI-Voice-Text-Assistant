import React, { useState, useEffect } from 'react';
import { useVoiceAssistant } from './hooks/useVoiceAssistant';
import VoiceButton from './components/VoiceButton';
import MessageList from './components/MessageList';
import TextInput from './components/TextInput';
import StatusIndicator from './components/StatusIndicator';
import SettingsModal from './components/SettingsModal';
import { Settings, Trash2, Bot } from 'lucide-react';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const {
    messages,
    isListening,
    isAlwaysListening,
    isProcessing,
    error,
    isSupported,
    startListening,
    stopListening,
    processCommand,
    clearMessages,
    updateConfig,
    setError
  } = useVoiceAssistant({ apiKey });

  const handleVoiceClick = () => {
    if (!apiKey) {
      setError('Please configure your Gemini API key in settings first.');
      setShowSettings(true);
      return;
    }

    if (isListening || isAlwaysListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleTextMessage = (message: string) => {
    if (!apiKey) {
      setError('Please configure your Gemini API key in settings first.');
      setShowSettings(true);
      return;
    }
    processCommand(message);
  };
  const handleSaveSettings = (newApiKey: string) => {
    setApiKey(newApiKey);
    updateConfig({ apiKey: newApiKey });
    setError(null);
  };

  // Scroll to bottom effect
  useEffect(() => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">ARIA</h1>
              <p className="text-sm text-gray-500">AI Voice & Text Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => clearMessages()}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Clear conversation"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Updated Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 h-[calc(100vh-100px)] flex flex-col">
        {/* Status Bar */}
        <div className="mb-6 flex justify-center">
          <StatusIndicator
            isListening={isListening}
            isProcessing={isProcessing}
            isSupported={isSupported}
            error={error}
          />
        </div>

        {/* Chat Interface */}
        <div className="flex-1 bg-gray-100 rounded-xl shadow-lg border border-gray-300 overflow-hidden mb-6">
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4" id="chat-container">
              <MessageList messages={messages} />
            </div>
            <div className="p-4 bg-white border-t border-gray-300">
              <TextInput
                onSendMessage={handleTextMessage}
                disabled={!isSupported}
                isProcessing={isProcessing}
              />
            </div>
          </div>
        </div>

        {/* Voice Control */}
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-4">
            <VoiceButton
              isListening={isListening}
              isAlwaysListening={isAlwaysListening}
              isProcessing={isProcessing}
              onClick={handleVoiceClick}
              disabled={!isSupported}
            />
            <p className="text-xs text-gray-400 text-center max-w-md">
              Try: "Open YouTube", "Create an image of a sunset", "What time is it?"
            </p>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={handleSaveSettings}
        currentApiKey={apiKey}
      />
    </div>
  );
}

export default App;
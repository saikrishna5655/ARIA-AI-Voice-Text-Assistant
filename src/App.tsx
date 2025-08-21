import React, { useState } from 'react';
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

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 h-[calc(100vh-100px)] flex flex-col">
        {/* Status Bar */}
        <div className="mb-6 flex justify-center">
          <StatusIndicator
            isListening={isListening}
            isProcessing={isProcessing}
            isSupported={isSupported}
            error={error}
          />
        </div>

        {/* Messages and Image Box */}
        <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-row overflow-hidden mb-6">
          <div className="flex-1 flex flex-col">
            <MessageList messages={messages} />
            <TextInput
              onSendMessage={handleTextMessage}
              disabled={!isSupported}
              isProcessing={isProcessing}
            />
          </div>
          <div className="w-1/3 bg-gray-50 border-l border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Generated Image</h3>
            {messages.some((msg) => msg.imageUrl) ? (
              <img
                src={messages.find((msg) => msg.imageUrl)?.imageUrl}
                alt="Generated content"
                className="w-full h-auto rounded-lg shadow-md"
              />
            ) : (
              <p className="text-sm text-gray-500">No image generated yet.</p>
            )}
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
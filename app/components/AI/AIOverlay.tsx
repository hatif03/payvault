'use client';

import { useState } from 'react';
import { FaComments, FaEye, FaShoppingCart, FaTimes } from 'react-icons/fa';
import { FileExplorer } from '../FileExplorer/FileExplorer';
import { WalletComp } from '../wallet/walletComp';
import ChatInterface from './ChatInterface';
import ContentPreview from './ContentPreview';
import MarketplaceDiscovery from './MarketplaceDiscovery';

interface AIOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sourceFiles?: string[];
}

interface GeneratedContent {
  title: string;
  content: string;
  wordCount: number;
  suggestedPrice: number;
  fileName: string;
  createdAt: Date;
}

export default function AIOverlay({ isOpen, onClose }: AIOverlayProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'preview'>('chat');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [marketplaceQuery, setMarketplaceQuery] = useState('');
  
  // Persistent chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI content creation assistant. I can help you analyze your files and prepare content for generation. What would you like to explore today?",
      timestamp: new Date()
    }
  ]);
  const [canGenerate, setCanGenerate] = useState(false);
  const [suggestedGeneration, setSuggestedGeneration] = useState<any>(null);

  const handleContentGenerated = (data: any) => {
    const newContent: GeneratedContent = {
      title: data.content.title,
      content: data.content.content,
      wordCount: data.content.wordCount,
      suggestedPrice: data.suggestedPrice,
      fileName: data.file.name,
      createdAt: new Date()
    };
    setGeneratedContent(prev => [newContent, ...prev]);
  };

  const handleCanGenerateChange = (canGen: boolean, suggestion?: any) => {
    setCanGenerate(canGen);
    setSuggestedGeneration(suggestion);
  };

  const handleChatUpdate = (messages: ChatMessage[]) => {
    setChatMessages(messages);
  };

  const handleMarketplaceSearch = (query: string) => {
    setMarketplaceQuery(query);
    setShowMarketplace(true);
  };

  const handlePurchaseComplete = (transactionData: any) => {
    console.log('Purchase completed:', transactionData);
    
    // Add a message about the successful purchase
    const purchaseMessage: ChatMessage = {
      role: 'assistant',
      content: `✅ Great! I've successfully processed your purchase. The content is now available in your files and ready for AI analysis. You can ask me to search through it or use it for content generation.`,
      timestamp: new Date()
    };
    
    const updatedMessages = [...chatMessages, purchaseMessage];
    setChatMessages(updatedMessages);
  };

  const handleClose = () => {
    // Reset all state when closing
    setChatMessages([
      {
        role: 'assistant',
        content: "Hi! I'm your AI content creation assistant. I can help you analyze your files and prepare content for generation. What would you like to explore today?",
        timestamp: new Date()
      }
    ]);
    setGeneratedContent([]);
    setCanGenerate(false);
    setSuggestedGeneration(null);
    setActiveTab('chat');
    setShowMarketplace(false);
    setMarketplaceQuery('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex">
      {/* File Explorer - Left Pane */}
      <div className="w-1/4 bg-slate-800 border-r-2 border-slate-600 flex flex-col">
        <div className="neopop-gradient-primary border-b-2 border-slate-600 p-4 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="font-anton text-xl text-white">Your Files</h2>
            {/* Wallet Component positioned in header */}
            <div className="shrink-0">
              {isOpen && <WalletComp compact={true} />}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0 p-4">
          <FileExplorer compact={true} />
        </div>
      </div>

      {/* Marketplace Discovery - Middle Pane */}
      <div className={`bg-slate-800 border-r-2 border-slate-600 flex flex-col transition-all duration-300 ${
        showMarketplace ? 'w-1/3' : 'w-0 overflow-hidden'
      }`}>
        {showMarketplace && (
          <>
            <div className="neopop-gradient-secondary border-b-2 border-slate-600 p-4 shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="font-anton text-xl flex items-center gap-2 text-white">
                  <FaShoppingCart />
                  Marketplace Discovery
                </h2>
                <button
                  onClick={() => setShowMarketplace(false)}
                  className="bg-red-500 hover:bg-red-600 border-2 border-slate-600 brutal-shadow-center hover:translate-y-1 transition-all px-3 py-1 font-freeman font-bold text-white rounded"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <MarketplaceDiscovery 
                query={marketplaceQuery} 
                onPurchaseComplete={handlePurchaseComplete}
              />
            </div>
          </>
        )}
      </div>

      {/* AI Interface - Right Pane */}
      <div className="flex-1 bg-slate-800 flex flex-col min-w-0">
        {/* Header with tabs and close button */}
        <div className="neopop-gradient-primary border-b-2 border-slate-600 p-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="font-anton text-xl text-white">AI Studio</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-4 py-2 border-2 border-slate-600 font-freeman transition-all rounded ${
                    activeTab === 'chat'
                      ? 'bg-slate-700 text-white brutal-shadow-center translate-y-1'
                      : 'bg-slate-600 hover:bg-slate-700 text-white brutal-shadow-left hover:translate-y-1'
                  }`}
                >
                  <FaComments className="inline mr-2" />
                  Chat
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-2 border-2 border-slate-600 font-freeman transition-all rounded ${
                    activeTab === 'preview'
                      ? 'bg-slate-700 text-white brutal-shadow-center translate-y-1'
                      : 'bg-slate-600 hover:bg-slate-700 text-white brutal-shadow-left hover:translate-y-1'
                  }`}
                >
                  <FaEye className="inline mr-2" />
                  Preview {canGenerate && <span className="bg-green-500 text-xs px-1 rounded">!</span>}
                </button>
              </div>
            </div>
            
            <button
              onClick={handleClose}
              title="Close AI Studio"
              className="w-12 h-10 bg-red-500 hover:bg-red-600 border-2 border-slate-600 brutal-shadow-center hover:translate-y-1 transition-all flex items-center justify-center font-bold text-white rounded"
            >
              <FaTimes className="text-white text-lg" />
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {activeTab === 'chat' ? (
            <ChatInterface 
              messages={chatMessages}
              onMessagesUpdate={handleChatUpdate}
              onCanGenerate={handleCanGenerateChange}
              onMarketplaceSearch={handleMarketplaceSearch}
              showMarketplace={showMarketplace}
            />
          ) : (
            <ContentPreview 
              generatedContent={generatedContent}
              canGenerate={canGenerate}
              suggestedGeneration={suggestedGeneration}
              chatMessages={chatMessages}
              onContentGenerated={handleContentGenerated}
            />
          )}
        </div>
      </div>
    </div>
  );
} 
"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { getSocket, disconnectSocket } from "@/lib/socket-client";
import { Message } from "@/lib/socket";
import { Send, Zap, Crown, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

// Action form component
function ActionForm({
  onSubmit,
  onCancel,
  selectedPlayer,
  slaveRank
}: {
  onSubmit: (action: string) => void;
  onCancel: () => void;
  selectedPlayer: 'Goddess' | 'slave';
  slaveRank: string;
}) {
  const [action, setAction] = useState('');

  const handleSubmit = () => {
    if (!action.trim()) return;
    onSubmit(action);
    // Reset form
    setAction('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gothic-crimson">Send Action</h3>

      {/* Action input */}
      <div>
        <label className="text-xs text-gothic-bone/60 mb-1 block">
          Action (use @Goddess or @{slaveRank} to mention)
        </label>
        <input
          type="text"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. laughed"
          className="w-full bg-gothic-black border border-gothic-darkRed rounded-md px-3 py-2 text-sm text-gothic-bone placeholder:text-gothic-bone/40 focus:outline-none focus:border-gothic-crimson"
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={!action.trim()}
          size="sm"
          className="flex-1"
        >
          Send Action
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          size="sm"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

// Rank change form component
function RankChangeForm({
  onSubmit,
  onCancel,
  currentRank
}: {
  onSubmit: (newRank: string, isPromotion: boolean) => void;
  onCancel: () => void;
  currentRank: string;
}) {
  const [rankType, setRankType] = useState<'promote' | 'demote'>('promote');
  const [newRank, setNewRank] = useState('');

  const handleSubmit = () => {
    if (!newRank) return;
    onSubmit(newRank, rankType === 'promote');
    // Reset form
    setRankType('promote');
    setNewRank('');
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gothic-crimson">Change Rank</h3>

      {/* Promote/Demote toggle */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setRankType('promote')}
          className={`p-2 rounded border text-sm transition-all active:scale-95 active:bg-gothic-bloodRed ${
            rankType === 'promote'
              ? 'bg-gothic-crimson border-gothic-crimson text-gothic-bone font-semibold'
              : 'bg-gothic-black border-gothic-darkRed text-gothic-bone/60 hover:border-gothic-crimson hover:text-gothic-bone'
          }`}
        >
          Promote
        </button>
        <button
          type="button"
          onClick={() => setRankType('demote')}
          className={`p-2 rounded border text-sm transition-all active:scale-95 active:bg-gothic-bloodRed ${
            rankType === 'demote'
              ? 'bg-gothic-crimson border-gothic-crimson text-gothic-bone font-semibold'
              : 'bg-gothic-black border-gothic-darkRed text-gothic-bone/60 hover:border-gothic-crimson hover:text-gothic-bone'
          }`}
        >
          Demote
        </button>
      </div>

      {/* Current rank display */}
      <div className="text-xs text-gothic-bone/60">
        Current rank: <span className="text-gothic-crimson font-semibold">{currentRank}</span>
      </div>

      {/* Custom rank input */}
      <div>
        <label className="text-xs text-gothic-bone/60 mb-1 block">New Rank</label>
        <input
          type="text"
          value={newRank}
          onChange={(e) => setNewRank(e.target.value)}
          placeholder="Enter new rank..."
          className="w-full bg-gothic-black border border-gothic-darkRed rounded-md px-3 py-2 text-sm text-gothic-bone placeholder:text-gothic-bone/40 focus:outline-none focus:border-gothic-crimson"
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={!newRank}
          size="sm"
          className="flex-1"
        >
          Change Rank
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          size="sm"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { user, isLoading, logout } = useAuth();
  const selectedPlayer = user?.role as 'Goddess' | 'slave'; // Use authenticated user's role
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showRankMenu, setShowRankMenu] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [slaveRank, setSlaveRank] = useState<string>("slave");
  const [otherPlayerOnline, setOtherPlayerOnline] = useState(false);
  const [otherPlayerTyping, setOtherPlayerTyping] = useState(false);
  const [otherPlayerTypingForLexi, setOtherPlayerTypingForLexi] = useState(false);
  const [lexiResponding, setLexiResponding] = useState(false);
  const [lexiTyping, setLexiTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to render text with highlighted mentions
  const renderWithMentions = (text: string) => {
    // Match @Goddess, @Lexi or @{any text} patterns
    const parts = text.split(/(@\w+)/g);

    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const mentionText = part.substring(1); // Remove the @
        const isLexi = mentionText === 'Lexi';
        return (
          <span
            key={index}
            className={`font-bold px-1 rounded ${
              isLexi
                ? 'text-purple-300 bg-purple-900/50'
                : 'text-gothic-bone bg-gothic-darkRed/50'
            }`}
          >
            {mentionText}
          </span>
        );
      }
      return part;
    });
  };

  // Load rank from blob on mount - MUST be before conditional returns
  useEffect(() => {
    const loadRank = async () => {
      try {
        const response = await fetch('/api/rank');
        if (response.ok) {
          const data = await response.json();
          setSlaveRank(data.rank || 'slave');
        }
      } catch (error) {
        console.error('Failed to load rank:', error);
      }
    };
    loadRank();
  }, []);

  useEffect(() => {
    if (selectedPlayer) {
      socketRef.current = getSocket();

      socketRef.current.on('connect', () => {
        setIsConnected(true);
        // Identify this player to the server
        socketRef.current?.emit('identify-player', selectedPlayer);
      });

      socketRef.current.on('disconnect', () => {
        setIsConnected(false);
      });

      socketRef.current.on('load-messages', (loadedMessages: Message[]) => {
        setMessages(loadedMessages);
      });

      socketRef.current.on('new-message', (message: Message) => {
        setMessages((prev) => [...prev, message]);

        // Update slave rank if this is a rank change message
        if (message.type === 'rank-change' && message.rankChange) {
          setSlaveRank(message.rankChange.newRank);
          // Save to blob
          fetch('/api/rank', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rank: message.rankChange.newRank })
          }).catch(err => console.error('Failed to save rank:', err));
        }
      });

      socketRef.current.on('rank-update', (newRank: string) => {
        setSlaveRank(newRank);
        // Save to blob
        fetch('/api/rank', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rank: newRank })
        }).catch(err => console.error('Failed to save rank:', err));
      });

      socketRef.current.on('online-status', (status: { Goddess: boolean; slave: boolean }) => {
        // Update the other player's online status
        const otherPlayer = selectedPlayer === 'Goddess' ? 'slave' : 'Goddess';
        setOtherPlayerOnline(status[otherPlayer]);
      });

      socketRef.current.on('user-typing', (data: string | { player: string; forLexi?: boolean }) => {
        // Handle both old string format and new object format for backwards compatibility
        const player = typeof data === 'string' ? data : data.player;
        const forLexi = typeof data === 'object' ? data.forLexi : false;

        // Handle Lexi typing separately
        if (player === 'Lexi') {
          setLexiTyping(true);
        } else if (player !== selectedPlayer) {
          // Only show typing indicator if it's the other player
          setOtherPlayerTyping(true);
          setOtherPlayerTypingForLexi(forLexi || false);
        }
      });

      socketRef.current.on('user-stopped-typing', (player: string) => {
        // Handle Lexi typing separately
        if (player === 'Lexi') {
          setLexiTyping(false);
        } else if (player !== selectedPlayer) {
          // Only hide typing indicator if it's the other player
          setOtherPlayerTyping(false);
          setOtherPlayerTypingForLexi(false);
        }
      });

      socketRef.current.on('lexi-responding', (isResponding: boolean) => {
        setLexiResponding(isResponding);
      });

      // If already connected, identify immediately
      if (socketRef.current.connected) {
        socketRef.current.emit('identify-player', selectedPlayer);
      }

      return () => {
        disconnectSocket();
      };
    }
  }, [selectedPlayer]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-gothic-crimson text-glow">Loading...</div>
      </main>
    );
  }

  // Redirect will be handled by AuthProvider, but we can show nothing while redirecting
  if (!user) {
    return null;
  }

  const handleSendAction = (action: string) => {
    if (!selectedPlayer || !socketRef.current) return;

    const message: Message = {
      id: Date.now().toString(),
      player: selectedPlayer,
      content: action,
      timestamp: Date.now(),
      type: 'action'
    };

    socketRef.current.emit('send-message', message);
    setShowActionMenu(false);
  };

  const handleRankChange = (newRank: string, isPromotion: boolean) => {
    if (!selectedPlayer || !socketRef.current || selectedPlayer !== 'Goddess') return;

    const rankChangeMessage: Message = {
      id: Date.now().toString(),
      player: selectedPlayer,
      content: isPromotion
        ? `sub has been promoted to ${newRank}`
        : `Goddess has been demoted sub to ${newRank}`,
      timestamp: Date.now(),
      type: 'rank-change',
      rankChange: {
        oldRank: slaveRank,
        newRank: newRank
      }
    };

    socketRef.current.emit('send-message', rankChangeMessage);
    setShowRankMenu(false);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || !selectedPlayer || !socketRef.current) return;

    // Regular message
    const message: Message = {
      id: Date.now().toString(),
      player: selectedPlayer,
      content: inputValue,
      timestamp: Date.now(),
      type: 'message'
    };

    socketRef.current.emit('send-message', message);
    setInputValue('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    // Emit typing event
    if (socketRef.current && e.target.value.length > 0) {
      // Check if the input contains @Lexi or @lexi
      const containsLexiMention = /@lexi/i.test(e.target.value);

      socketRef.current.emit('typing', {
        player: selectedPlayer,
        forLexi: containsLexiMention
      });

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to emit stopped typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('stopped-typing', selectedPlayer);
      }, 2000);
    } else if (socketRef.current && e.target.value.length === 0) {
      // If input is cleared, emit stopped typing immediately
      socketRef.current.emit('stopped-typing', selectedPlayer);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();

      // Clear typing indicator when message is sent
      if (socketRef.current) {
        socketRef.current.emit('stopped-typing', selectedPlayer);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const getPlaceholder = () => {
    if (lexiResponding) {
      return 'Lexi is responding... Please wait.';
    }
    return 'Type a message... (use @Lexi to summon the goddess)';
  };

  // Helper to get display name for a player
  const getDisplayName = (player: string) => {
    if (player === 'Goddess') return 'Goddess';
    if (player === 'Lexi') return 'Lexi';
    return slaveRank;
  };

  return (
    <main className="min-h-screen flex flex-col p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl mx-auto flex flex-col h-[calc(100vh-4rem)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-gothic text-gothic-crimson text-glow">
              Chat Room - {getDisplayName(selectedPlayer)}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Other player online status */}
            <div className={`flex items-center gap-2 ${otherPlayerOnline ? 'text-green-500' : 'text-gothic-bone/40'}`}>
              <div className={`w-2 h-2 rounded-full ${otherPlayerOnline ? 'bg-green-500 animate-pulse' : 'bg-gothic-bone/40'}`} />
              <span className="text-sm">
                {getDisplayName(selectedPlayer === 'Goddess' ? 'slave' : 'Goddess')} {otherPlayerOnline ? 'Online' : 'Offline'}
              </span>
            </div>

          </div>
        </div>

        {/* Messages */}
        <Card className="flex-1 flex flex-col candle-glow overflow-hidden">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 relative">
            <div
              className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
              style={{ backgroundImage: 'url(/queen-bg.png)' }}
            />
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex relative z-10 ${message.type === 'action' || message.type === 'rank-change' ? 'justify-center' : message.player === selectedPlayer ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'ai' ? (
                    // AI message from Lexi - special goddess styling
                    <div className="flex flex-col items-center gap-1 max-w-[85%]">
                      <div className="bg-gradient-to-r from-purple-900/30 via-gothic-darkRed/30 to-purple-900/30 border-2 border-purple-500/50 rounded-lg px-4 py-3 shadow-lg shadow-purple-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Crown className="w-4 h-4 text-purple-400" />
                          <span className="text-xs font-bold text-purple-300">Lexi - Royal Black Cat Goddess</span>
                        </div>
                        <div className="text-gothic-bone wrap-break-word leading-relaxed">
                          {message.content}
                        </div>
                      </div>
                      <div className="text-xs text-gothic-bone/40">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ) : message.type === 'action' ? (
                    // Action message - centered with special styling
                    <div className="flex flex-col items-center gap-1 max-w-[80%]">
                      <div className="text-gothic-crimson italic text-center wrap-break-word">
                        {getDisplayName(message.player)} {renderWithMentions(message.content)}
                      </div>
                      <div className="text-xs text-gothic-bone/40">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ) : message.type === 'rank-change' ? (
                    // Rank change message - centered with special styling
                    <div className="flex flex-col items-center gap-1 max-w-[80%]">
                      <div className="bg-gothic-darkRed/50 border border-gothic-crimson rounded-lg px-4 py-2">
                        <div className="text-gothic-crimson font-bold text-center wrap-break-word">
                          {message.content}
                        </div>
                        {message.rankChange && (
                          <div className="text-xs text-gothic-bone/60 text-center mt-1">
                            {message.rankChange.oldRank} → {message.rankChange.newRank}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gothic-bone/40">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ) : (
                    // Regular message - chatbox bubble
                    <div className="flex flex-col gap-1 max-w-[70%]">
                      <div
                        className={`rounded-2xl p-3 backdrop-blur-sm ${
                          message.player === selectedPlayer
                            ? 'bg-red-950/40 rounded-br-sm'
                            : 'bg-white/20 rounded-bl-sm'
                        }`}
                      >
                        <div className="text-xs text-gothic-bone/80 mb-1 font-semibold">
                          {getDisplayName(message.player)}
                        </div>
                        <div className="text-gothic-bone wrap-break-word">
                          {message.content}
                        </div>
                      </div>
                      <div className={`text-xs text-gothic-bone/40 px-2 ${message.player === selectedPlayer ? 'text-right' : 'text-left'}`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} className="relative z-10" />
          </CardContent>

          {/* Typing indicator - fixed at bottom of messages */}
          <AnimatePresence>
            {(otherPlayerTyping || lexiTyping) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 py-2 border-t border-gothic-darkRed/50"
              >
                <div className="flex items-center gap-2 text-xs text-gothic-bone/60">
                  <div className="flex gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${lexiTyping ? 'bg-purple-400' : 'bg-gothic-crimson'}`} style={{ animationDelay: '0ms' }} />
                    <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${lexiTyping ? 'bg-purple-400' : 'bg-gothic-crimson'}`} style={{ animationDelay: '150ms' }} />
                    <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${lexiTyping ? 'bg-purple-400' : 'bg-gothic-crimson'}`} style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className={lexiTyping ? 'text-purple-300' : ''}>
                    {lexiTyping ? (
                      <span className="flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        Lexi is typing...
                      </span>
                    ) : (
                      `${getDisplayName(selectedPlayer === 'Goddess' ? 'slave' : 'Goddess')} is ${otherPlayerTypingForLexi ? 'typing for Lexi...' : 'typing...'}`
                    )}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input */}
          <div className="p-4 border-t border-gothic-darkRed space-y-3">
            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setShowActionMenu(!showActionMenu)}
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={lexiResponding}
              >
                <Zap className="w-4 h-4" />
                Send Action
              </Button>

              {selectedPlayer === 'Goddess' && (
                <Button
                  onClick={() => setShowRankMenu(!showRankMenu)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={lexiResponding}
                >
                  <Crown className="w-4 h-4" />
                  Change Rank
                </Button>
              )}
            </div>

            {/* Action menu */}
            {showActionMenu && (
              <div className="bg-gothic-black border border-gothic-darkRed rounded-md p-4 space-y-3">
                <ActionForm
                  onSubmit={handleSendAction}
                  onCancel={() => setShowActionMenu(false)}
                  selectedPlayer={selectedPlayer}
                  slaveRank={slaveRank}
                />
              </div>
            )}

            {/* Rank change menu */}
            {showRankMenu && selectedPlayer === 'Goddess' && (
              <div className="bg-gothic-black border border-gothic-darkRed rounded-md p-4 space-y-3">
                <RankChangeForm
                  onSubmit={handleRankChange}
                  onCancel={() => setShowRankMenu(false)}
                  currentRank={slaveRank}
                />
              </div>
            )}

            {/* Message input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={getPlaceholder()}
                disabled={lexiResponding}
                className="flex-1 bg-gothic-black border border-gothic-darkRed rounded-md px-4 py-2 text-gothic-bone placeholder:text-gothic-bone/40 focus:outline-none focus:border-gothic-crimson disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || lexiResponding}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </main>
  );
}

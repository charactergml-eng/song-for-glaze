"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { getSocket, disconnectSocket } from "@/lib/socket-client";
import { Message } from "@/lib/socket";
import { Send, ArrowLeft } from "lucide-react";

type CommandStep = 'none' | 'action' | 'player' | 'count';

interface ActionCommand {
  action: string;
  targetPlayer: 'Goddess' | 'slave' | null;
  count: string;
  unit: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [selectedPlayer, setSelectedPlayer] = useState<'Goddess' | 'slave' | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [commandStep, setCommandStep] = useState<CommandStep>('none');
  const [actionCommand, setActionCommand] = useState<ActionCommand>({
    action: '',
    targetPlayer: null,
    count: '',
    unit: ''
  });
  const [isConnected, setIsConnected] = useState(false);
  const [slaveRank, setSlaveRank] = useState<string>("slave");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

  // Load rank from blob on mount
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

      return () => {
        disconnectSocket();
      };
    }
  }, [selectedPlayer]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || !selectedPlayer || !socketRef.current) return;

    // Check for promote/demote commands (only for Goddess)
    if (selectedPlayer === 'Goddess') {
      const promoteMatch = inputValue.match(/^\/promote\s+(.+)$/i);
      const demoteMatch = inputValue.match(/^\/demote\s+(.+)$/i);

      if (promoteMatch) {
        const newRank = promoteMatch[1].trim();
        const rankChangeMessage: Message = {
          id: Date.now().toString(),
          player: selectedPlayer,
          content: `Player 2 has been promoted to ${newRank}`,
          timestamp: Date.now(),
          type: 'rank-change',
          rankChange: {
            oldRank: slaveRank,
            newRank: newRank
          }
        };
        socketRef.current.emit('send-message', rankChangeMessage);
        setInputValue('');
        return;
      }

      if (demoteMatch) {
        const newRank = demoteMatch[1].trim();
        const rankChangeMessage: Message = {
          id: Date.now().toString(),
          player: selectedPlayer,
          content: `Goddess has been demoted sub to ${newRank}`,
          timestamp: Date.now(),
          type: 'rank-change',
          rankChange: {
            oldRank: slaveRank,
            newRank: newRank
          }
        };
        socketRef.current.emit('send-message', rankChangeMessage);
        setInputValue('');
        return;
      }
    }

    // Check if user is initiating an action command
    if (inputValue === '/action') {
      setCommandStep('action');
      setInputValue('');
      return;
    }

    // Handle action command flow
    if (commandStep === 'action') {
      setActionCommand({ ...actionCommand, action: inputValue });
      setCommandStep('player');
      setInputValue('');
      return;
    }

    if (commandStep === 'player') {
      // If they type /player, skip to count step without a target
      if (inputValue === '/player' || inputValue.trim() === '') {
        setActionCommand({ ...actionCommand, targetPlayer: null });
        setCommandStep('count');
        setInputValue('');
        return;
      }

      // Otherwise, set the target player
      const lowerInput = inputValue.toLowerCase();
      const targetPlayer = lowerInput.includes('Goddess') ? 'Goddess' :
                          lowerInput.includes('slave') ? 'slave' : null;
      setActionCommand({ ...actionCommand, targetPlayer });
      setCommandStep('count');
      setInputValue('');
      return;
    }

    if (commandStep === 'count') {
      // Extract count and unit from input (e.g., "3 times", "5 minutes", "10")
      const words = inputValue.trim().split(/\s+/);
      const count = words[0];
      const unit = words.slice(1).join(' ');

      // Convert action to past tense (simple heuristic)
      const getPastTense = (verb: string): string => {
        const lowerVerb = verb.toLowerCase();

        // Common irregular verbs
        const irregularVerbs: { [key: string]: string } = {
          'shoot': 'shot',
          'run': 'ran',
          'eat': 'ate',
          'drink': 'drank',
          'sleep': 'slept',
          'give': 'gave',
          'take': 'took',
          'make': 'made',
          'go': 'went',
          'come': 'came',
          'see': 'saw',
          'sit': 'sat',
          'stand': 'stood',
          'write': 'wrote',
          'read': 'read',
          'hear': 'heard',
          'say': 'said',
          'tell': 'told',
          'get': 'got',
          'find': 'found',
          'think': 'thought',
          'know': 'knew',
          'feel': 'felt',
          'leave': 'left',
          'meet': 'met',
          'bring': 'brought',
          'buy': 'bought',
          'catch': 'caught',
          'fight': 'fought',
          'teach': 'taught',
          'build': 'built',
          'send': 'sent',
          'spend': 'spent',
          'lose': 'lost',
          'win': 'won',
          'hit': 'hit',
          'hurt': 'hurt',
          'let': 'let',
          'put': 'put',
          'set': 'set',
          'cut': 'cut',
          'shut': 'shut',
          'throw': 'threw',
          'wear': 'wore',
          'break': 'broke',
          'speak': 'spoke',
          'steal': 'stole',
          'choose': 'chose',
          'freeze': 'froze',
          'bite': 'bit',
          'hide': 'hid',
          'ride': 'rode',
          'drive': 'drove',
          'draw': 'drew',
          'fall': 'fell',
          'fly': 'flew',
          'grow': 'grew',
          'blow': 'blew',
          'show': 'showed',
          'sing': 'sang',
          'ring': 'rang',
          'swim': 'swam',
          'begin': 'began',
          'shrink': 'shrank',
          'sink': 'sank',
          'shake': 'shook',
          'wake': 'woke',
          'beat': 'beat',
          'become': 'became',
          'bend': 'bent',
          'hold': 'held',
          'sell': 'sold',
          'feed': 'fed',
          'bleed': 'bled',
        };

        if (irregularVerbs[lowerVerb]) {
          return irregularVerbs[lowerVerb];
        }

        // Regular verbs - simple rules
        if (lowerVerb.endsWith('e')) {
          return lowerVerb + 'd';
        } else if (lowerVerb.endsWith('y') && !['a', 'e', 'i', 'o', 'u'].includes(lowerVerb[lowerVerb.length - 2])) {
          return lowerVerb.slice(0, -1) + 'ied';
        } else if (lowerVerb.match(/[^aeiou][aeiou][^aeiou]$/)) {
          // Double last consonant for CVC pattern (e.g., hug -> hugged)
          return lowerVerb + lowerVerb[lowerVerb.length - 1] + 'ed';
        } else {
          return lowerVerb + 'ed';
        }
      };

      const pastTenseAction = getPastTense(actionCommand.action);

      // Build the action message
      let actionText = `${selectedPlayer} ${pastTenseAction}`;
      if (actionCommand.targetPlayer) {
        actionText += ` ${actionCommand.targetPlayer}`;
      }
      actionText += ` ${count}`;
      if (unit) {
        actionText += ` ${unit}`;
      }

      const message: Message = {
        id: Date.now().toString(),
        player: selectedPlayer,
        content: actionText,
        timestamp: Date.now(),
        type: 'action',
        action: {
          type: actionCommand.action,
          target: actionCommand.targetPlayer,
          count: count,
          unit: unit
        }
      };

      socketRef.current.emit('send-message', message);
      setCommandStep('none');
      setActionCommand({ action: '', targetPlayer: null, count: '', unit: '' });
      setInputValue('');
      return;
    }

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getPlaceholder = () => {
    switch (commandStep) {
      case 'action':
        return 'Type the action (e.g., shoot, tickle, hug)...';
      case 'player':
        return 'Type Goddess, slave, or press Enter to skip...';
      case 'count':
        return 'Type count and unit (e.g., "3 times", "5 minutes")...';
      default:
        if (selectedPlayer === 'Goddess') {
          return 'Type a message, /action, /promote <rank>, or /demote <rank>...';
        }
        return 'Type a message or /action to perform an action...';
    }
  };

  if (!selectedPlayer) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl"
        >
          <h1 className="text-4xl md:text-5xl font-gothic text-gothic-crimson text-glow text-center mb-12">
            Select Your Player
          </h1>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card
                className="candle-glow h-full cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedPlayer('Goddess')}
              >
                <CardHeader>
                  <CardTitle className="text-center text-3xl">
                    Goddess
                  </CardTitle>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card
                className="candle-glow h-full cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedPlayer('slave')}
              >
                <CardHeader>
                  <CardTitle className="text-center text-3xl">
                    {slaveRank}
                  </CardTitle>
                </CardHeader>
              </Card>
            </motion.div>
          </div>

          <div className="flex justify-center mt-8">
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </div>

          {/* Decorative candles */}
          <div className="flex gap-4 justify-center mt-12">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-8 bg-gothic-bloodRed rounded-full animate-candle-flicker candle-glow"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </motion.div>
      </main>
    );
  }

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
            <Button
              onClick={() => setSelectedPlayer(null)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Change Player
            </Button>
            <h1 className="text-2xl md:text-3xl font-gothic text-gothic-crimson text-glow">
              Chat Room - {selectedPlayer === 'Goddess' ? 'Goddess' : slaveRank}
            </h1>
          </div>
          <div className={`flex items-center gap-2 ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>

        {/* Messages */}
        <Card className="flex-1 flex flex-col candle-glow overflow-hidden">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex ${message.type === 'action' || message.type === 'rank-change' ? 'justify-center' : message.player === selectedPlayer ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'action' ? (
                    // Action message - centered with special styling
                    <div className="flex flex-col items-center gap-1 max-w-[80%]">
                      <div className="text-gothic-crimson italic text-center break-words">
                        {message.content}
                      </div>
                      <div className="text-xs text-gothic-bone/40">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ) : message.type === 'rank-change' ? (
                    // Rank change message - centered with special styling
                    <div className="flex flex-col items-center gap-1 max-w-[80%]">
                      <div className="bg-gothic-darkRed/50 border border-gothic-crimson rounded-lg px-4 py-2">
                        <div className="text-gothic-crimson font-bold text-center break-words">
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
                    // Regular message - normal bubble
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.player === selectedPlayer
                          ? 'bg-gothic-darkRed'
                          : 'bg-gothic-black border border-gothic-darkRed'
                      }`}
                    >
                      <div className="text-xs text-gothic-bone/60 mb-1">
                        {message.player === 'Goddess' ? 'Goddess' : slaveRank}
                      </div>
                      <div className="text-gothic-bone break-words">
                        {message.content}
                      </div>
                      <div className="text-xs text-gothic-bone/40 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input */}
          <div className="p-4 border-t border-gothic-darkRed">
            {commandStep !== 'none' && (
              <div className="mb-2 text-sm text-gothic-crimson">
                Command Mode: {commandStep === 'action' && 'Enter action'}
                {commandStep === 'player' && `Action "${actionCommand.action}" - Select target player (or skip)`}
                {commandStep === 'count' && `${actionCommand.targetPlayer ? `Target: ${actionCommand.targetPlayer} -` : ''} Enter count and unit`}
                <button
                  onClick={() => {
                    setCommandStep('none');
                    setActionCommand({ action: '', targetPlayer: null, count: '', unit: '' });
                    setInputValue('');
                  }}
                  className="ml-4 text-xs underline hover:text-gothic-bloodRed"
                >
                  Cancel
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={getPlaceholder()}
                className="flex-1 bg-gothic-black border border-gothic-darkRed rounded-md px-4 py-2 text-gothic-bone placeholder:text-gothic-bone/40 focus:outline-none focus:border-gothic-crimson"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
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

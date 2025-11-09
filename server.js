// Load environment variables from .env.local first
require('dotenv').config({ path: '.env.local' });

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { connectToDatabase, MessageModel } = require('./lib/mongodb.js');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Connect to MongoDB on startup
let isMongoConnected = false;
console.log('🔄 Attempting to connect to MongoDB...');
console.log('📍 MONGODB_URI:', process.env.MONGODB_URI ? 'Set ✓' : 'Not set ✗');

connectToDatabase()
  .then(() => {
    isMongoConnected = true;
    console.log('✅ MongoDB connected successfully');
    console.log('✅ MongoDB ready for chat history');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('⚠️ Chat will work but messages will not be persisted');
  });

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    path: '/api/socket/io',
    addTrailingSlash: false,
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  const messages = [];
  const onlinePlayers = {
    Goddess: false,
    slave: false
  };

  // Track if Lexi (AI) is currently generating a response
  let lexiIsResponding = false;
  // Track if Sumi (AI) is currently generating a response
  let sumiIsResponding = false;

  // Track all connected visitors (sockets)
  const connectedVisitors = new Set();

  const broadcastVisitorCount = () => {
    const count = connectedVisitors.size;
    io.emit('visitor-count', count);
    console.log(`Broadcasting visitor count: ${count}`);
  };

  io.on('connection', async (socket) => {
    console.log('Client connected:', socket.id);

    // Add visitor immediately on connection
    connectedVisitors.add(socket.id);
    console.log(`New connection: ${socket.id}, Total visitors: ${connectedVisitors.size}`);

    // Send current visitor count to the new client
    socket.emit('visitor-count', connectedVisitors.size);

    // Broadcast to all clients
    broadcastVisitorCount();

    // Load messages from MongoDB if connected, otherwise use in-memory messages
    let messagesToSend = messages;
    console.log(`📊 Connection status - MongoDB: ${isMongoConnected ? 'Connected ✓' : 'Not connected ✗'}`);

    if (isMongoConnected) {
      try {
        const dbMessages = await MessageModel.find()
          .sort({ timestamp: 1 })
          .limit(100)
          .lean();

        console.log(`📚 Found ${dbMessages.length} messages in MongoDB`);

        // Transform MongoDB messages to match client format (remove _id, __v)
        messagesToSend = dbMessages.map(msg => ({
          id: msg.id,
          player: msg.player,
          content: msg.content,
          timestamp: msg.timestamp,
          type: msg.type,
          ...(msg.rankChange && { rankChange: msg.rankChange })
        }));

        console.log(`✅ Loaded ${messagesToSend.length} messages from MongoDB`);
      } catch (error) {
        console.error('❌ Error loading messages from MongoDB:', error);
        messagesToSend = messages;
      }
    } else {
      console.log(`📝 Using in-memory messages: ${messages.length} messages`);
    }

    // Send existing messages to new client
    socket.emit('load-messages', messagesToSend);

    // Send current online status for chat players
    socket.emit('online-status', onlinePlayers);

    // Handle general visitor connection (optional now, as we add on connection)
    socket.on('visitor-connected', () => {
      console.log(`Visitor-connected event from: ${socket.id}`);
    });

    // Handle player identification (for chat)
    socket.on('identify-player', (player) => {
      socket.player = player;
      onlinePlayers[player] = true;
      console.log(`Player ${player} is now online`);

      // Broadcast updated online status to all clients
      io.emit('online-status', onlinePlayers);
    });

    socket.on('send-message', async (message) => {
      // Check if message mentions @Lexi BEFORE adding to messages
      const shouldSummonLexi = (message.content.includes('@Lexi') || message.content.includes('@lexi')) && !lexiIsResponding;

      // Check if message mentions @Sumi
      const shouldSummonSumi = (message.content.includes('@Sumi') || message.content.includes('@sumi')) && !sumiIsResponding && !lexiIsResponding;

      // Check if message mentions @stats
      const shouldShowStats = message.content.includes('@stats');

      // Process slave actions through AI rephraser
      // if (message.player === 'slave' && message.type === 'action') {
      //   try {
      //     console.log(`🔄 Intercepting slave action: "${message.content}"`);

      //     // Notify all clients that action is being processed
      //     io.emit('action-processing', { player: 'slave', processing: true });

      //     // Get current slave stats
      //     const statsResponse = await fetch(`http://${hostname}:${port}/api/stats`, {
      //       method: 'GET',
      //       headers: {
      //         'Content-Type': 'application/json',
      //       },
      //     });

      //     if (statsResponse.ok) {
      //       const statsData = await statsResponse.json();
      //       console.log(`📊 Current slave stats:`, statsData.stats);

      //       // Call the action rephraser AI
      //       const rephraseResponse = await fetch(`http://${hostname}:${port}/api/stats/rephrase-action`, {
      //         method: 'POST',
      //         headers: {
      //           'Content-Type': 'application/json',
      //         },
      //         body: JSON.stringify({
      //           action: message.content,
      //           stats: statsData.stats,
      //         }),
      //       });

      //       if (rephraseResponse.ok) {
      //         const rephraseData = await rephraseResponse.json();
      //         const rephrasedAction = rephraseData.rephrasedAction;

      //         console.log(`✍️ Action rephrased from "${message.content}" to "${rephrasedAction}"`);

      //         // Replace the message content with the rephrased action
      //         message.content = rephrasedAction;
      //       } else {
      //         console.error('Failed to rephrase action:', rephraseResponse.statusText);
      //       }
      //     } else {
      //       console.error('Failed to fetch stats:', statsResponse.statusText);
      //     }

      //     // Notify all clients that action processing is complete
      //     io.emit('action-processing', { player: 'slave', processing: false });
      //   } catch (error) {
      //     console.error('Error processing slave action:', error);
      //     // Notify all clients that action processing is complete even on error
      //     io.emit('action-processing', { player: 'slave', processing: false });
      //     // If error occurs, continue with original action
      //   }
      // }

      // Save to in-memory array
      messages.push(message);

      // Save to MongoDB if connected
      if (isMongoConnected) {
        try {
          await MessageModel.create(message);
          console.log(`💾 Saved message to MongoDB: ${message.type} from ${message.player}`);
        } catch (error) {
          console.error('Error saving message to MongoDB:', error);
        }
      }

      io.emit('new-message', message);

      // Process stat changes if Goddess sends an action or rank change
      // if (message.player === 'Goddess' && (message.type === 'action' || message.type === 'rank-change')) {
      //   try {
      //     console.log(`📊 Processing stat changes for ${message.type}: ${message.content}`);

      //     // Notify all clients that action is being processed
      //     io.emit('action-processing', { player: 'Goddess', processing: true });

      //     // Call the stat processor AI
      //     const statProcessResponse = await fetch(`http://${hostname}:${port}/api/stats/process-action`, {
      //       method: 'POST',
      //       headers: {
      //         'Content-Type': 'application/json',
      //       },
      //       body: JSON.stringify({
      //         action: message.content,
      //         actionType: message.type,
      //       }),
      //     });

      //     if (statProcessResponse.ok) {
      //       const statData = await statProcessResponse.json();
      //       const { hungerChange, waterChange, healthChange } = statData.changes;
      //       const impactMessage = statData.impactMessage;

      //       console.log(`📊 AI determined stat changes:`, statData.changes);
      //       console.log(`💬 Impact message:`, impactMessage);

      //       // Apply the stat changes
      //       const applyStatsResponse = await fetch(`http://${hostname}:${port}/api/stats`, {
      //         method: 'PATCH',
      //         headers: {
      //           'Content-Type': 'application/json',
      //         },
      //         body: JSON.stringify({
      //           hungerChange,
      //           waterChange,
      //           healthChange,
      //         }),
      //       });

      //       if (applyStatsResponse.ok) {
      //         const updatedStats = await applyStatsResponse.json();
      //         console.log(`✅ Updated slave stats:`, updatedStats.stats);

      //         // Broadcast stat update to all clients
      //         io.emit('stats-updated', updatedStats.stats);

      //         // Send the impact message to chat if it exists
      //         if (impactMessage) {
      //           const impactChatMessage = {
      //             id: Date.now().toString() + '-impact',
      //             player: 'System',
      //             content: `Hunger: ${hungerChange} + Water: ${waterChange} + Health: ${healthChange}`,
      //             timestamp: Date.now(),
      //             type: 'action'
      //           };

      //           // Save to in-memory array
      //           messages.push('Hunger: ' + hungerChange);
      //           messages.push('Water: ' + waterChange);
      //           messages.push('Health: ' + healthChange);

      //           // Save to MongoDB if connected
      //           if (isMongoConnected) {
      //             try {
      //               await MessageModel.create(impactChatMessage);
      //               console.log(`💾 Saved impact message to MongoDB`);
      //             } catch (error) {
      //               console.error('Error saving impact message to MongoDB:', error);
      //             }
      //           }

      //           // Broadcast the impact message to all clients
      //           io.emit('new-message', impactChatMessage);
      //         }
      //       }
      //     }

      //     // Notify all clients that action processing is complete
      //     io.emit('action-processing', { player: 'Goddess', processing: false });
      //   } catch (error) {
      //     console.error('Error processing stat changes:', error);
      //     // Notify all clients that action processing is complete even on error
      //     io.emit('action-processing', { player: 'Goddess', processing: false });
      //   }
      // }

      // Handle @stats command
      // if (shouldShowStats) {
      //   try {
      //     console.log(`📊 Fetching stats for @stats command`);

      //     const statsResponse = await fetch(`http://${hostname}:${port}/api/stats`, {
      //       method: 'GET',
      //       headers: {
      //         'Content-Type': 'application/json',
      //       },
      //     });

      //     if (statsResponse.ok) {
      //       const statsData = await statsResponse.json();
      //       console.log(`📊 Current stats:`, statsData.stats);

      //       // Create a stats message
      //       const statsMessage = {
      //         id: Date.now().toString() + '-stats',
      //         player: 'System',
      //         content: JSON.stringify(statsData.stats),
      //         timestamp: Date.now(),
      //         type: 'stats'
      //       };

      //       // Save to in-memory array
      //       messages.push(statsMessage);

      //       // Save to MongoDB if connected
      //       if (isMongoConnected) {
      //         try {
      //           await MessageModel.create(statsMessage);
      //           console.log(`💾 Saved stats message to MongoDB`);
      //         } catch (error) {
      //           console.error('Error saving stats message to MongoDB:', error);
      //         }
      //       }

      //       io.emit('new-message', statsMessage);
      //     }
      //   } catch (error) {
      //     console.error('Error fetching stats:', error);
      //   }
      // }

      // Check if message mentions @Lexi
      if (shouldSummonLexi) {
        lexiIsResponding = true;

        // Emit reply-lock status to all clients
        io.emit('lexi-responding', true);

        // Simulate Lexi typing
        io.emit('user-typing', 'Lexi');

        try {
          // Strip @Lexi mention from the message
          const strippedMessage = message.content.replace(/@Lexi\s*/gi, '').trim();

          // Format the current message with the player's name
          let playerName = '';
          if (message.player === 'Goddess') {
            playerName = 'Goddess Batoul';
          } else if (message.player === 'slave') {
            playerName = 'Slave Hasan';
          } else {
            playerName = `Slave ${message.player}`;
          }

          const userMessage = `${playerName}: ${strippedMessage}`;

          // Get conversation history EXCLUDING the message we just added
          // We want the last 20 messages before the current one
          const conversationHistory = messages.slice(0, -1).slice(-20);

          // Call the AI API
          const response = await fetch(`http://${hostname}:${port}/api/ai-chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: userMessage,
              conversationHistory: conversationHistory,
            }),
          });

          if (response.ok) {
            const data = await response.json();

            // Stop typing indicator
            io.emit('user-stopped-typing', 'Lexi');

            // Create Lexi's message
            const lexiMessage = {
              id: Date.now().toString(),
              player: 'Lexi',
              content: data.reply,
              timestamp: Date.now(),
              type: 'ai'
            };

            // Save to in-memory array
            messages.push(lexiMessage);

            // Save to MongoDB if connected
            if (isMongoConnected) {
              try {
                await MessageModel.create(lexiMessage);
                console.log(`💾 Saved Lexi's response to MongoDB`);
              } catch (error) {
                console.error('Error saving Lexi message to MongoDB:', error);
              }
            }

            io.emit('new-message', lexiMessage);

            // Check if Lexi mentioned Sumi in her response
            const lexiMentionedSumi = /\bSUMI\b/i.test(data.reply);

            if (lexiMentionedSumi && !sumiIsResponding) {
              console.log('🐱 Lexi mentioned Sumi! Triggering auto-response...');

              // Wait a brief moment for dramatic effect
              await new Promise(resolve => setTimeout(resolve, 1000));

              // Trigger Sumi's auto-response
              sumiIsResponding = true;
              io.emit('sumi-responding', true);
              io.emit('user-typing', 'Sumi');

              try {
                // Get updated conversation history including Lexi's message
                const sumiConversationHistory = messages.slice(-20);

                // Call Sumi's AI API with context that he was mentioned by Lexi
                const sumiResponse = await fetch(`http://${hostname}:${port}/api/ai-sumi`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    message: `Lexi: ${data.reply}`,
                    conversationHistory: sumiConversationHistory,
                    lexiJustMentionedSumi: true,
                  }),
                });

                if (sumiResponse.ok) {
                  const sumiData = await sumiResponse.json();

                  // Stop typing indicator
                  io.emit('user-stopped-typing', 'Sumi');

                  // Create Sumi's message
                  const sumiMessage = {
                    id: Date.now().toString(),
                    player: 'Sumi',
                    content: sumiData.reply,
                    timestamp: Date.now(),
                    type: 'ai'
                  };

                  // Save to in-memory array
                  messages.push(sumiMessage);

                  // Save to MongoDB if connected
                  if (isMongoConnected) {
                    try {
                      await MessageModel.create(sumiMessage);
                      console.log(`💾 Saved Sumi's auto-response to MongoDB`);
                    } catch (error) {
                      console.error('Error saving Sumi message to MongoDB:', error);
                    }
                  }

                  io.emit('new-message', sumiMessage);
                } else {
                  console.error('Sumi AI API error:', sumiResponse.statusText);
                  io.emit('user-stopped-typing', 'Sumi');
                }
              } catch (error) {
                console.error('Error calling Sumi AI API:', error);
                io.emit('user-stopped-typing', 'Sumi');
              } finally {
                sumiIsResponding = false;
                io.emit('sumi-responding', false);
              }
            }
          } else {
            console.error('AI API error:', response.statusText);
            io.emit('user-stopped-typing', 'Lexi');
          }
        } catch (error) {
          console.error('Error calling AI API:', error);
          io.emit('user-stopped-typing', 'Lexi');
        } finally {
          lexiIsResponding = false;
          io.emit('lexi-responding', false);
        }
      }

      // Check if message mentions @Sumi (direct mention by user)
      if (shouldSummonSumi) {
        sumiIsResponding = true;

        // Emit reply-lock status to all clients
        io.emit('sumi-responding', true);

        // Simulate Sumi typing
        io.emit('user-typing', 'Sumi');

        try {
          // Strip @Sumi mention from the message
          const strippedMessage = message.content.replace(/@Sumi\s*/gi, '').trim();

          // Format the current message with the player's name
          let playerName = '';
          if (message.player === 'Goddess') {
            playerName = 'Goddess Batoul';
          } else if (message.player === 'slave') {
            playerName = 'Slave Hasan';
          } else {
            playerName = `Slave ${message.player}`;
          }

          const userMessage = `${playerName}: ${strippedMessage}`;

          // Get conversation history EXCLUDING the message we just added
          const conversationHistory = messages.slice(0, -1).slice(-20);

          // Call Sumi's AI API
          const response = await fetch(`http://${hostname}:${port}/api/ai-sumi`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: userMessage,
              conversationHistory: conversationHistory,
              lexiJustMentionedSumi: false,
            }),
          });

          if (response.ok) {
            const data = await response.json();

            // Stop typing indicator
            io.emit('user-stopped-typing', 'Sumi');

            // Create Sumi's message
            const sumiMessage = {
              id: Date.now().toString(),
              player: 'Sumi',
              content: data.reply,
              timestamp: Date.now(),
              type: 'ai'
            };

            // Save to in-memory array
            messages.push(sumiMessage);

            // Save to MongoDB if connected
            if (isMongoConnected) {
              try {
                await MessageModel.create(sumiMessage);
                console.log(`💾 Saved Sumi's response to MongoDB`);
              } catch (error) {
                console.error('Error saving Sumi message to MongoDB:', error);
              }
            }

            io.emit('new-message', sumiMessage);
          } else {
            console.error('Sumi AI API error:', response.statusText);
            io.emit('user-stopped-typing', 'Sumi');
          }
        } catch (error) {
          console.error('Error calling Sumi AI API:', error);
          io.emit('user-stopped-typing', 'Sumi');
        } finally {
          sumiIsResponding = false;
          io.emit('sumi-responding', false);
        }
      }
    });

    socket.on('typing', (data) => {
      // Handle both old string format and new object format for backwards compatibility
      const typingData = typeof data === 'string' ? { player: data, forLexi: false } : data;
      // Broadcast to all clients that this player is typing
      io.emit('user-typing', typingData);
    });

    socket.on('stopped-typing', (player) => {
      // Broadcast to all clients that this player stopped typing
      io.emit('user-stopped-typing', player);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);

      // Remove from visitors
      connectedVisitors.delete(socket.id);
      broadcastVisitorCount();

      // Update online status when player disconnects
      if (socket.player) {
        onlinePlayers[socket.player] = false;
        console.log(`Player ${socket.player} is now offline`);
        io.emit('online-status', onlinePlayers);
      }
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Environment: ${dev ? 'development' : 'production'}`);
    });
});

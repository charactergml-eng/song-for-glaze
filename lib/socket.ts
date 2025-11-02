import { Server as NetServer } from 'http';
import { NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO;
    };
  };
};

export interface Message {
  id: string;
  player: 'player1' | 'player2';
  content: string;
  timestamp: number;
  type: 'message' | 'action';
  action?: {
    type: string;
    target: 'player1' | 'player2' | null;
    count: string;
    unit: string;
  };
}

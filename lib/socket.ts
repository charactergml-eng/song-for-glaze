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
  player: 'Goddess' | 'slave';
  content: string;
  timestamp: number;
  type: 'message' | 'action' | 'rank-change';
  action?: {
    type: string;
    target: 'Goddess' | 'slave' | null;
    count: string;
    unit: string;
  };
  rankChange?: {
    oldRank: string;
    newRank: string;
  };
}

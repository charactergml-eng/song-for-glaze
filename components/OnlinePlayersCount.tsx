"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket-client";
import { Users } from "lucide-react";

export function OnlinePlayersCount() {
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    const socket = getSocket();

    const updateOnlineCount = (count: number) => {
      console.log('Received visitor count:', count);
      setOnlineCount(count);
    };

    socket.on('connect', () => {
      console.log('Socket connected, emitting visitor-connected');
      // Identify as a general visitor
      socket.emit('visitor-connected');
    });

    socket.on('visitor-count', updateOnlineCount);

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // If already connected, identify immediately
    if (socket.connected) {
      console.log('Socket already connected, emitting visitor-connected');
      socket.emit('visitor-connected');
    } else {
      console.log('Socket not yet connected, waiting for connect event');
    }

    return () => {
      socket.off('visitor-count', updateOnlineCount);
      socket.off('connect_error');
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-gothic-black/80 backdrop-blur-sm border border-gothic-darkRed rounded-lg px-4 py-2 shadow-lg">
      <Users className="w-4 h-4 text-gothic-crimson" />
      <span className="text-sm text-gothic-bone">
        <span className="font-semibold text-gothic-crimson">{onlineCount}</span> online
      </span>
    </div>
  );
}

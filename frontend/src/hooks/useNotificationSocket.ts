import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '../store/auth.store';

// Connects to the backend's STOMP WebSocket endpoint for instant
// notification delivery. Existing 30-second polling in
// useNotifications.ts is left completely untouched and keeps running
// as a fallback â€” if this socket is disconnected or fails to connect,
// polling still delivers notifications, just with up to a 30s delay.
export const useNotificationSocket = (enabled: boolean) => {
  const queryClient = useQueryClient();
  const clientRef = useRef<Client | null>(null);
  const { user, accessToken } = useAuthStore();

  useEffect(() => {
    if (!enabled || !user || !accessToken) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws') as unknown as WebSocket,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      reconnectDelay: 5000, // auto-reconnect every 5s if the connection drops
      onConnect: () => {
        client.subscribe('/user/queue/notifications', () => {
          // We don't need to parse the payload here â€” simplest and
          // safest approach is to just invalidate the existing React
          // Query cache, which triggers the same list/unread-count
          // refetch the 30s poll already uses. This guarantees the
          // displayed data always matches exactly what polling would
          // have shown, with no separate "socket data shape" to keep
          // in sync with the REST response shape.
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers['message']);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [enabled, user, accessToken, queryClient]);
};
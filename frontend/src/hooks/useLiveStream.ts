import { useState, useEffect, useRef } from 'react';
import type { SentinelEvent } from '../types';
import { get } from '../services/api';

interface LiveStreamResult {
  events:       SentinelEvent[];
  eventsPerMin: number;
  isConnected:  boolean;
}

const mapEvent = (e: any): SentinelEvent => ({
  id: e.id,
  userId: e.user_id,
  userName: e.user_name || 'System User',
  type: e.type,
  source: e.raw_features ? (JSON.parse(e.raw_features).source || 'web') : 'web',
  amount: e.amount,
  ipAddress: e.ip_address || '127.0.0.1',
  device: e.device || 'Browser',
  location: e.location || 'Unknown Location',
  country: e.location ? e.location.split(', ').pop() || 'India' : 'India',
  countryCode: 'IN',
  latitude: 19.076,
  longitude: 72.877,
  timestamp: e.timestamp,
  status: e.risk_score > 60 ? 'flagged' : e.risk_score > 30 ? 'suspicious' : 'normal',
  riskScore: e.risk_score
});

export function useLiveStream(initialCount = 12): LiveStreamResult {
  const [events, setEvents]           = useState<SentinelEvent[]>([]);
  const [eventsPerMin, setEventsPerMin] = useState(14);
  const [isConnected, setIsConnected]   = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchEvents = async () => {
    try {
      const res = await get<any>('/events/', { page: 1, limit: initialCount });
      if (res && res.data) {
        setEvents((res.data || []).map(mapEvent));
        setIsConnected(true);
      }
    } catch (err) {
      console.error("Error fetching initial events list:", err);
    }
  };

  useEffect(() => {
    // 1. Load initial events log history
    fetchEvents();

    // 2. Resolve WebSocket endpoint address
    const getWsUrl = () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      // Strip /api if present and change protocol
      const base = apiUrl.replace(/\/api$/, '').replace(/\/$/, '');
      return base.replace(/^http/, 'ws') + '/ws/events';
    };

    const wsUrl = getWsUrl();
    let socket: WebSocket;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connectWs = () => {
      console.log(`Connecting to WebSocket at ${wsUrl}...`);
      socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        console.log("WebSocket connection established successfully.");
        setIsConnected(true);
      };

      socket.onmessage = (eventMsg) => {
        try {
          const payload = JSON.parse(eventMsg.data);
          if (payload.type === 'event' && payload.data) {
            const newEvent = mapEvent(payload.data);
            setEvents((prev) => [newEvent, ...prev.slice(0, initialCount - 1)]);
            // Increment events/min indicator slightly on active alert stream
            setEventsPerMin((v) => Math.min(60, v + 1));
          }
        } catch (e) {
          console.error("Failed to parse WebSocket stream payload:", e);
        }
      };

      socket.onclose = () => {
        console.warn("WebSocket disconnected. Retrying in 4s...");
        setIsConnected(false);
        reconnectTimeout = setTimeout(connectWs, 4000);
      };

      socket.onerror = (err) => {
        console.error("WebSocket connection encountered an error:", err);
        socket.close();
      };
    };

    // Begin socket connection
    connectWs();

    // Periodic eventsPerMin decay to simulate real-time volatility
    const interval = setInterval(() => {
      setEventsPerMin(v => Math.max(5, v + Math.floor(Math.random() * 5) - 2));
    }, 5000);

    return () => {
      if (wsRef.current) {
        // Remove close listener to prevent reconnect loops during cleanup
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
      clearTimeout(reconnectTimeout);
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [initialCount]);

  return { events, eventsPerMin, isConnected };
}

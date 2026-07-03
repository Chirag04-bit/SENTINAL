import { useState, useEffect, useRef } from 'react';
import type { SentinelEvent } from '../types';
import { get } from '../services/api';
import { LIVE_STREAM_INTERVAL_MS } from '../utils/constants';

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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchEvents = async () => {
    try {
      const res = await get<any>('/events/', { page: 1, limit: initialCount });
      if (res && res.data) {
        setEvents((res.data || []).map(mapEvent));
        setIsConnected(true);
      }
    } catch (err) {
      console.error("Error polling events stream: ", err);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchEvents();

    // Set polling interval
    intervalRef.current = setInterval(() => {
      fetchEvents();
      // Add slight jitter to events per min
      setEventsPerMin(v => Math.max(5, Math.min(40, v + Math.floor(Math.random() * 5) - 2)));
    }, LIVE_STREAM_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsConnected(false);
    };
  }, [initialCount]);

  return { events, eventsPerMin, isConnected };
}

// ─── useLiveStream ────────────────────────────────────────────────────────────
// Simulates a real-time event stream.
// Phase 7: Replace the interval with a WebSocket connection to the backend.
//
// Usage:
//   const { events, eventsPerMin } = useLiveStream();

import { useState, useEffect, useRef } from 'react';
import { generateLiveEvent, MOCK_EVENTS } from '../data/mockData';
import type { SentinelEvent } from '../types';
import { LIVE_STREAM_INTERVAL_MS, LIVE_FEED_MAX_ROWS } from '../utils/constants';

interface LiveStreamResult {
  events:       SentinelEvent[];
  eventsPerMin: number;
  isConnected:  boolean;
}

export function useLiveStream(initialCount = 12): LiveStreamResult {
  const [events, setEvents]           = useState<SentinelEvent[]>(
    () => MOCK_EVENTS.slice(0, initialCount),
  );
  const [eventsPerMin, setEventsPerMin] = useState(14);
  const [isConnected, setIsConnected]   = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setIsConnected(true);

    intervalRef.current = setInterval(() => {
      const ev = generateLiveEvent();
      setEvents(prev => [ev, ...prev.slice(0, LIVE_FEED_MAX_ROWS - 1)]);
      setEventsPerMin(v => Math.max(5, Math.min(40, v + Math.floor(Math.random() * 5) - 2)));
    }, LIVE_STREAM_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsConnected(false);
    };
  }, []);

  return { events, eventsPerMin, isConnected };
}

// ─── useDebounce ──────────────────────────────────────────────────────────────
// Delays updating a value until the user stops typing.
// Used in search inputs to avoid firing on every keystroke.
//
// Usage:
//   const debouncedSearch = useDebounce(searchInput, 400);
//   // API call fires only when user stops typing for 400ms

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer); // Clean up on value change
  }, [value, delayMs]);

  return debounced;
}

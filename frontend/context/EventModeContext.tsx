import React, { createContext, useContext, useMemo, useState } from 'react';

type EventModeContextValue = {
  activeEvent: any | null;
  dismissedEventId: string | null;
  isInEventMode: boolean;
  enterEventMode: (event: any) => void;
  leaveEventMode: () => void;
};

const EventModeContext = createContext<EventModeContextValue | null>(null);

export function EventModeProvider({ children }: { children: React.ReactNode }) {
  const [activeEvent, setActiveEvent] = useState<any | null>(null);
  const [dismissedEventId, setDismissedEventId] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      activeEvent,
      dismissedEventId,
      isInEventMode: Boolean(activeEvent),
      enterEventMode: (event: any) => {
        setDismissedEventId(null);
        setActiveEvent(event);
      },
      leaveEventMode: () => {
        setDismissedEventId(activeEvent?.id ? String(activeEvent.id) : null);
        setActiveEvent(null);
      },
    }),
    [activeEvent, dismissedEventId],
  );

  return <EventModeContext.Provider value={value}>{children}</EventModeContext.Provider>;
}

export function useEventMode() {
  const context = useContext(EventModeContext);

  if (!context) {
    throw new Error('useEventMode must be used inside EventModeProvider');
  }

  return context;
}

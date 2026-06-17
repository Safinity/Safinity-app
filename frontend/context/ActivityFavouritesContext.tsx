import { useAuth } from '@clerk/expo';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  addFavouriteActivity,
  getEventFavouriteActivities,
  removeFavouriteActivity,
} from '../utils/favourites';

type ActivityFavouritesContextValue = {
  favouriteActivityIds: Set<string>;
  favouriteActivitiesByEvent: Record<string, any[]>;
  updatingActivityIds: Set<string>;
  loadingEventIds: Set<string>;
  selectedCalendarEventId: string | null;
  setSelectedCalendarEventId: (eventId: string | null) => void;
  isActivityFavourite: (activityId: string | number) => boolean;
  loadEventFavourites: (eventId: string | number, force?: boolean) => Promise<any[]>;
  toggleFavouriteActivity: (
    activity: any,
    eventId: string | number,
    shouldBeFavourite: boolean,
  ) => Promise<void>;
};

const ActivityFavouritesContext = createContext<ActivityFavouritesContextValue | null>(null);

function getActivityIds(activities: any[]) {
  return activities.map(activity => String(activity.id));
}

export function ActivityFavouritesProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  const [favouriteActivitiesByEvent, setFavouriteActivitiesByEvent] = useState<
    Record<string, any[]>
  >({});
  const [favouriteIdsByEvent, setFavouriteIdsByEvent] = useState<Record<string, string[]>>({});
  const [loadingEventIds, setLoadingEventIds] = useState<Set<string>>(new Set());
  const [updatingActivityIds, setUpdatingActivityIds] = useState<Set<string>>(new Set());
  const [selectedCalendarEventId, setSelectedCalendarEventId] = useState<string | null>(null);

  const favouriteActivityIds = useMemo(
    () => new Set(Object.values(favouriteIdsByEvent).flat()),
    [favouriteIdsByEvent],
  );

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded || isSignedIn) {
      return;
    }

    setFavouriteActivitiesByEvent({});
    setFavouriteIdsByEvent({});
    setLoadingEventIds(new Set());
    setUpdatingActivityIds(new Set());
  }, [isLoaded, isSignedIn]);

  const loadEventFavourites = useCallback(
    async (eventId: string | number, force = false) => {
      const normalizedEventId = String(eventId);

      if (!isLoaded || !isSignedIn) {
        setFavouriteActivitiesByEvent(prev => ({ ...prev, [normalizedEventId]: [] }));
        setFavouriteIdsByEvent(prev => ({ ...prev, [normalizedEventId]: [] }));
        return [];
      }

      setLoadingEventIds(prev => {
        const next = new Set(prev);
        next.add(normalizedEventId);
        return next;
      });

      try {
        const token = await getTokenRef.current();
        const favourites = await getEventFavouriteActivities(token, normalizedEventId);

        setFavouriteActivitiesByEvent(prev => ({
          ...prev,
          [normalizedEventId]: favourites,
        }));
        setFavouriteIdsByEvent(prev => ({
          ...prev,
          [normalizedEventId]: getActivityIds(favourites),
        }));

        return favourites;
      } finally {
        setLoadingEventIds(prev => {
          const next = new Set(prev);
          next.delete(normalizedEventId);
          return next;
        });
      }
    },
    [isLoaded, isSignedIn],
  );

  const toggleFavouriteActivity = useCallback(
    async (activity: any, eventId: string | number, shouldBeFavourite: boolean) => {
      if (!isLoaded || !isSignedIn) {
        throw new Error('É preciso iniciar sessão para gerir favoritos.');
      }

      if (!eventId) {
        throw new Error('Evento inválido para gerir favoritos.');
      }

      const normalizedEventId = String(eventId);
      const activityId = String(activity.id);
      const previousActivities = favouriteActivitiesByEvent[normalizedEventId] || [];
      const previousIds = favouriteIdsByEvent[normalizedEventId] || [];

      setUpdatingActivityIds(prev => {
        const next = new Set(prev);
        next.add(activityId);
        return next;
      });

      setFavouriteActivitiesByEvent(prev => {
        const current = prev[normalizedEventId] || [];
        const nextActivities = shouldBeFavourite
          ? current.some(item => String(item.id) === activityId)
            ? current
            : [...current, activity]
          : current.filter(item => String(item.id) !== activityId);

        return { ...prev, [normalizedEventId]: nextActivities };
      });
      setFavouriteIdsByEvent(prev => {
        const current = prev[normalizedEventId] || [];
        const nextIds = shouldBeFavourite
          ? current.includes(activityId)
            ? current
            : [...current, activityId]
          : current.filter(id => id !== activityId);

        return { ...prev, [normalizedEventId]: nextIds };
      });

      try {
        const token = await getTokenRef.current();

        if (shouldBeFavourite) {
          await addFavouriteActivity(token, activityId);
        } else {
          await removeFavouriteActivity(token, activityId);
        }
      } catch (error) {
        setFavouriteActivitiesByEvent(prev => ({
          ...prev,
          [normalizedEventId]: previousActivities,
        }));
        setFavouriteIdsByEvent(prev => ({
          ...prev,
          [normalizedEventId]: previousIds,
        }));
        throw error;
      } finally {
        setUpdatingActivityIds(prev => {
          const next = new Set(prev);
          next.delete(activityId);
          return next;
        });
      }
    },
    [favouriteActivitiesByEvent, favouriteIdsByEvent, isLoaded, isSignedIn],
  );

  const value = useMemo(
    () => ({
      favouriteActivityIds,
      favouriteActivitiesByEvent,
      updatingActivityIds,
      loadingEventIds,
      selectedCalendarEventId,
      setSelectedCalendarEventId,
      isActivityFavourite: (activityId: string | number) =>
        favouriteActivityIds.has(String(activityId)),
      loadEventFavourites,
      toggleFavouriteActivity,
    }),
    [
      favouriteActivityIds,
      favouriteActivitiesByEvent,
      updatingActivityIds,
      loadingEventIds,
      selectedCalendarEventId,
      loadEventFavourites,
      toggleFavouriteActivity,
    ],
  );

  return (
    <ActivityFavouritesContext.Provider value={value}>
      {children}
    </ActivityFavouritesContext.Provider>
  );
}

export function useActivityFavourites() {
  const context = useContext(ActivityFavouritesContext);

  if (!context) {
    throw new Error('useActivityFavourites must be used inside ActivityFavouritesProvider');
  }

  return context;
}

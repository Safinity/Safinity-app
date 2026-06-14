import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth, useUser as useClerkUser } from '@clerk/expo';
import users from '@/data/users.json';

const UserContext = createContext<any>(null);

function buildFallbackUser(clerkUser: any) {
  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? '';
  const localPart = email.split('@')[0] || 'user';

  return {
    id: clerkUser?.id ?? email,
    name: clerkUser?.fullName || clerkUser?.firstName || email || 'User',
    username: clerkUser?.username || localPart,
    email,
    image: 'default',
    friends: [],
    currentEventId: null,
    pastEvents: [],
  };
}

export function UserProvider({ children }: any) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { isLoaded, isSignedIn } = useAuth();
  const { user: clerkUser } = useClerkUser();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !clerkUser) {
      setCurrentUser(null);
      return;
    }

    const email = clerkUser.primaryEmailAddress?.emailAddress?.toLowerCase();
    const foundUser = email ? users.find(u => u.email.toLowerCase() === email) : undefined;
    setCurrentUser(foundUser ?? buildFallbackUser(clerkUser));
  }, [clerkUser, isLoaded, isSignedIn]);

  const addFriend = (friendId: string) => {
    setCurrentUser((prev: any) => {
      if (!prev) return prev;

      return {
        ...prev,
        friends: prev.friends.includes(friendId) ? prev.friends : [...prev.friends, friendId],
      };
    });
  };

  const removeFriend = (friendId: string) => {
    setCurrentUser((prev: any) => {
      if (!prev) return prev;

      return {
        ...prev,
        friends: prev.friends.filter((id: string) => id !== friendId),
      };
    });
  };

  return (
    <UserContext.Provider value={{ currentUser, addFriend, removeFriend }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import users from '@/data/users.json';
import auth from '@/data/auth.json';

const UserContext = createContext<any>(null);

export function UserProvider({ children }: any) {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const currentId = auth.currentUserId;
    const foundUser = users.find(u => u.id === currentId);
    setCurrentUser(foundUser);
  }, []);

  const addFriend = (friendId: string) => {
    setCurrentUser(prev => ({
      ...prev,
      friends: [...prev.friends, friendId],
    }));
  };

  const removeFriend = (friendId: string) => {
    setCurrentUser(prev => ({
      ...prev,
      friends: prev.friends.filter((id: string) => id !== friendId),
    }));
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

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface Roommate {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinedAt: string;
  status: 'pending' | 'accepted' | 'rejected';
  invitedBy: string;
}

interface RoommateContextType {
  roommates: Roommate[];
  addRoommate: (roommate: Omit<Roommate, 'id' | 'joinedAt' | 'status' | 'invitedBy'>) => void;
  removeRoommate: (id: string) => void;
  updateRoommate: (id: string, roommate: Partial<Roommate>) => void;
  getRoommateById: (id: string) => Roommate | undefined;
  acceptInvitation: (id: string) => void;
  rejectInvitation: (id: string) => void;
  isLoading: boolean;
}

const RoommateContext = createContext<RoommateContextType | undefined>(undefined);

export function useRoommates() {
  const context = useContext(RoommateContext);
  if (context === undefined) {
    throw new Error('useRoommates must be used within a RoommateProvider');
  }
  return context;
}

export function RoommateProvider({ children }: { children: React.ReactNode }) {
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const savedRoommates = localStorage.getItem('roommates');
    if (savedRoommates) {
      setRoommates(JSON.parse(savedRoommates));
    } else if (currentUser) {
      // Demo data - includes the current user as the first roommate
      const demoRoommates: Roommate[] = [
        {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          avatar: currentUser.avatar,
          joinedAt: new Date().toISOString(),
          status: 'accepted',
          invitedBy: currentUser.id
        }
      ];
      setRoommates(demoRoommates);
      localStorage.setItem('roommates', JSON.stringify(demoRoommates));
    }
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('roommates', JSON.stringify(roommates));
    }
  }, [roommates, isLoading]);

  const addRoommate = (roommate: Omit<Roommate, 'id' | 'joinedAt' | 'status' | 'invitedBy'>) => {
    if (!currentUser) return;
    
    const newRoommate: Roommate = {
      ...roommate,
      id: Date.now().toString(),
      joinedAt: new Date().toISOString(),
      status: 'pending',
      invitedBy: currentUser.id
    };
    setRoommates(prevRoommates => [...prevRoommates, newRoommate]);
  };

  const removeRoommate = (id: string) => {
    if (currentUser && id === currentUser.id) {
      return;
    }
    setRoommates(prevRoommates => prevRoommates.filter(roommate => roommate.id !== id));
  };

  const updateRoommate = (id: string, updatedRoommate: Partial<Roommate>) => {
    setRoommates(prevRoommates => 
      prevRoommates.map(roommate => 
        roommate.id === id ? { ...roommate, ...updatedRoommate } : roommate
      )
    );
  };

  const getRoommateById = (id: string) => {
    return roommates.find(roommate => roommate.id === id);
  };

  const acceptInvitation = (id: string) => {
    updateRoommate(id, { status: 'accepted' });
  };

  const rejectInvitation = (id: string) => {
    updateRoommate(id, { status: 'rejected' });
  };

  const value = {
    roommates,
    addRoommate,
    removeRoommate,
    updateRoommate,
    getRoommateById,
    acceptInvitation,
    rejectInvitation,
    isLoading
  };

  return <RoommateContext.Provider value={value}>{children}</RoommateContext.Provider>;
}
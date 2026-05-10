import { useContext } from 'react';
import { TravelContext } from './travelContext.js';

export function useTravel() {
  const context = useContext(TravelContext);
  if (!context) {
    throw new Error('useTravel must be used within TravelProvider');
  }
  return context;
}


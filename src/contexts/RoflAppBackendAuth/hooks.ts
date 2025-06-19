import { useContext } from 'react';
import { RoflAppBackendAuthContext } from './Context';

export function useRoflAppBackendAuthContext() {
  const context = useContext(RoflAppBackendAuthContext);
  if (context === undefined) {
    throw new Error(
      'useRoflAppBackendAuthContext must be used within a RoflAppBackendAuthProvider'
    );
  }
  return context;
}

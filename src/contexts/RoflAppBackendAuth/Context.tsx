import { createContext } from 'react';

type RoflAppBackendAuthContextType = {
  login: () => Promise<string | undefined>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  token: string | null;
};

export const RoflAppBackendAuthContext = createContext<
  RoflAppBackendAuthContextType | undefined
>(undefined);

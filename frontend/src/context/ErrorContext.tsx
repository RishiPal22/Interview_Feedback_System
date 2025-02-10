import { createContext } from "react";

interface ErrorContextType {
  error: string | null;
  setError: (message: string | null) => void;
}

export const ErrorContext = createContext<ErrorContextType | undefined>(undefined);




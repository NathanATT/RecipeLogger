import { createContext } from 'react';
import type { ApiError } from '../types';

// Define the shape of the context's value
export interface ErrorContextType {
  showError: (userMessage: string, technicalError?: ApiError | Error) => void;
}

// Create and export the context object itself
export const ErrorContext = createContext<ErrorContextType | undefined>(undefined);
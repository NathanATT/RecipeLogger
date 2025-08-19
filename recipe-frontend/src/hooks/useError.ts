import { useContext } from 'react';
// We need to import the actual context object, so we must export it from the context file.
import { ErrorContext } from '../context/ErrorContextDefinition';

// This is the custom hook that provides easy access to the context.
export const useError = () => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};
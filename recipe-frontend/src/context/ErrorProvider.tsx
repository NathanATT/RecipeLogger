import React from 'react';
import type { ReactNode } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import type { ApiError } from '../types'; 
import { ErrorContext } from './ErrorContextDefinition';
import type { ErrorContextType } from './ErrorContextDefinition';
import DetailedErrorToast from '../components/DetailedErrorToast';


// The provider component that will wrap our application
export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const showError = (userMessage: string, technicalError?: ApiError | Error) => {
    toast.error(<DetailedErrorToast userMessage={userMessage} technicalError={technicalError} />, {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const value: ErrorContextType = { showError };

  return (
    <ErrorContext.Provider value={value}>
      {children}
      <ToastContainer theme="dark" />
    </ErrorContext.Provider>
  );
};


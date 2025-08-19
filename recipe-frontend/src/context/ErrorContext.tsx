import React from 'react';
import type { ReactNode } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import type { ApiError } from '../types'; 
import { ErrorContext } from './ErrorContextDefinition';
import type { ErrorContextType } from './ErrorContextDefinition';



// A custom component for our detailed error toast
const DetailedErrorToast: React.FC<{ userMessage: string; technicalError?: ApiError | Error }> = ({ userMessage, technicalError }) => {
  const [isDetailsVisible, setIsDetailsVisible] = React.useState(false);

  return (
    <div>
      <p>{userMessage}</p>
      {technicalError && (
        <button 
          onClick={() => setIsDetailsVisible(!isDetailsVisible)}
          style={{ background: 'none', border: '1px solid', borderRadius: '4px', color: 'white', cursor: 'pointer', marginTop: '10px' }}
        >
          {isDetailsVisible ? 'Hide Details' : 'View Details'}
        </button>
      )}
      {isDetailsVisible && technicalError && (
        <pre style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', marginTop: '10px', fontSize: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          <code>{JSON.stringify((technicalError as ApiError).response?.data || technicalError.message, null, 2)}</code>
        </pre>
      )}
    </div>
  );
};

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

